/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Attendance } from '../services/attendanceApi';
import {
  getCurrentAttendanceStatus,
  getStatusColor,
  getStatusText,
  canTakeAttendanceAction,
} from '../utils/statusHelpers';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_STARTED' | 'ONGOING' | 'READY_TO_CHECKIN';

export type ScheduleCardProps = {
    attendance: Attendance;
    onPress: () => void;
    onOptionsPress?: () => void;
};

const ScheduleCard = ({
    attendance,
    onPress,
}: ScheduleCardProps) => {
    // Extract necessary data from attendance object
    const { schedule, status: apiStatus, check_in_time } = attendance;
    const { course, instructor, room, start_time, end_time, schedule_date } = schedule;

    console.log(`ScheduleCard ${attendance.attendance_id}: Rendering with date ${schedule_date}, status ${apiStatus}`);

    // Use enhanced status determination logic
    const status: AttendanceStatus = (attendance as any).computedStatus || getCurrentAttendanceStatus(
        apiStatus,
        start_time,
        end_time,
        check_in_time
    );

    // Check if attendance action is allowed
    const canTakeAction = canTakeAttendanceAction(status);

    console.log(`ScheduleCard ${attendance.attendance_id}: Final status: ${status}, Can take action: ${canTakeAction}`);

    // Format time range for display (e.g., "15:15 - 18:15")
    const timeDisplay = `${start_time} - ${end_time}`;

    const getStatusIcon = () => {
        switch (status) {
            case 'ONGOING':
                return 'play-circle-outline';
            case 'PRESENT':
                return 'checkmark-circle-outline';
            case 'LATE':
                return 'alert-circle-outline';
            case 'ABSENT':
                return 'close-circle-outline';
            case 'READY_TO_CHECKIN':
                return 'log-in-outline';
            default:
                return 'hourglass-outline';
        }
    };

    const renderAttendanceStatus = () => {
        if (status === 'NOT_STARTED') {
            return null;
        }

        return (
            <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor(status)}20` }]}>
                <View style={styles.statusIndicatorRow}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {getStatusText(status)}
                    </Text>
                    <Icon name={getStatusIcon()} size={16} color={getStatusColor(status)} style={styles.statusIcon} />
                </View>

                {/* Show check-in time */}
                {check_in_time && (
                    <View style={styles.timeRow}>
                        <Icon name="log-in-outline" size={14} color="#666" />
                        <Text style={styles.checkInText}>Masuk: {check_in_time}</Text>
                    </View>
                )}

                {/* Show action hints for actionable statuses */}
                {canTakeAction && (
                    <View style={styles.actionHintRow}>
                        <Icon name="hand-left-outline" size={14} color={getStatusColor(status)} />
                        <Text style={[styles.actionHintText, { color: getStatusColor(status) }]}>
                            {status === 'READY_TO_CHECKIN' ? 'Tap untuk check-in' : 'Tap untuk absen sekarang'}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderReadyToCheckInIndicator = () => {
        if (status === 'READY_TO_CHECKIN') {
            return (
                <View style={styles.readyIndicator}>
                    <Icon name="information-circle" size={16} color="#2196F3" />
                    <Text style={styles.readyText}>Siap untuk check-in</Text>
                </View>
            );
        }
        return null;
    };

    const renderOngoingIndicator = () => {
        if (status === 'ONGOING') {
            return (
                <View style={styles.ongoingIndicator}>
                    <Icon name="radio-button-on" size={16} color="#FF9800" />
                    <Text style={styles.ongoingText}>Kelas sedang berlangsung</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                (status !== 'NOT_STARTED') && { borderLeftWidth: 5, borderLeftColor: getStatusColor(status) },
                canTakeAction && styles.cardActionable,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.courseInfoContainer}>
                    <Text style={styles.cardTitle}>{course.course_name}</Text>
                    <Text
                        style={styles.cardSubtitle}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {schedule.chapter}
                    </Text>
                </View>

                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{timeDisplay}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Icon name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{room.name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="person-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{instructor.full_name}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                {renderReadyToCheckInIndicator()}
                {renderOngoingIndicator()}
                {/* {renderAttendanceStatus()} */}
            </View>

            {/* Action indicator for tappable cards */}
            {canTakeAction && (
                <View style={styles.actionIndicator}>
                    <Icon name="chevron-forward" size={20} color="#666" />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        padding: 15,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 0,
        position: 'relative',
    },
    cardActionable: {
        shadowOpacity: 0.15,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    courseInfoContainer: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#232F40',
        marginBottom: 3,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        lineHeight: 18,
    },
    timeContainer: {
        backgroundColor: '#f0f4f8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        justifyContent: 'center',
        minWidth: 110,
        flexShrink: 0,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#232F40',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    cardFooter: {
        marginTop: 5,
    },
    statusContainer: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    statusIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
    },
    statusIcon: {
        marginLeft: 5,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    checkInText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    actionHintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    actionHintText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 5,
        fontStyle: 'italic',
    },
    readyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 8,
    },
    readyText: {
        fontSize: 12,
        color: '#1976D2',
        fontWeight: '500',
        marginLeft: 6,
    },
    ongoingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 8,
    },
    ongoingText: {
        fontSize: 12,
        color: '#F57C00',
        fontWeight: '500',
        marginLeft: 6,
    },
    actionIndicator: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        opacity: 0.6,
    },
});

export default ScheduleCard;
