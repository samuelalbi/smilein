// src/components/ScheduleList.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import ScheduleCard from './ScheduleCard';
import { Attendance } from '../services/attendanceApi';
import { getCurrentAttendanceStatus } from '../utils/statusHelpers';

interface ScheduleListProps {
    attendances: Attendance[];
    onSchedulePress: (attendance: Attendance) => void;
    isLoading: boolean;
    onRefresh?: () => Promise<void>;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
    attendances,
    onSchedulePress,
    isLoading,
    onRefresh,
}) => {
    const [refreshing, setRefreshing] = React.useState(false);
    const [isNavigating, setIsNavigating] = React.useState<number | null>(null);

    const handleRefresh = async () => {
        if (onRefresh) {
            setRefreshing(true);
            await onRefresh();
            setRefreshing(false);
        }
    };

    const handleSchedulePress = (attendance: Attendance) => {
        if (isNavigating === attendance.attendance_id) {return;}

        setIsNavigating(attendance.attendance_id);
        onSchedulePress(attendance);

        // Reset navigation state after a delay
        setTimeout(() => {
            setIsNavigating(null);
        }, 1000);
    };

    // Process attendances to add computed status if not already present
    const processedAttendances = React.useMemo(() => {
        return attendances.map(attendance => {
            // Skip processing if computedStatus already exists
            if ((attendance as any).computedStatus) {
                return attendance;
            }

            // Add computed status if schedule data exists
            if (attendance.schedule?.start_time && attendance.schedule?.end_time) {
                const computedStatus = getCurrentAttendanceStatus(
                    attendance.status,
                    attendance.schedule.start_time,
                    attendance.schedule.end_time,
                    attendance.check_in_time
                );

                console.log(`ScheduleList: Processing attendance ${attendance.attendance_id} - API Status: ${attendance.status}, Computed: ${computedStatus}`);

                return {
                    ...attendance,
                    computedStatus,
                };
            }

            return attendance;
        });
    }, [attendances]);

    const renderScheduleItem = ({ item }: { item: Attendance }) => (
        <ScheduleCard
            attendance={item}
            onPress={() => handleSchedulePress(item)}
        />
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada jadwal hari ini</Text>
            <Text style={styles.emptySubText}>
                Selamat menikmati hari libur Anda! 🎉
            </Text>
        </View>
    );

    const renderLoadingComponent = () => (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#232F40" />
            <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
    );

    if (isLoading && !refreshing && processedAttendances.length === 0) {
        return (
            <View style={styles.curvedContainer}>
                {renderLoadingComponent()}
            </View>
        );
    }

    return (
        <View style={styles.curvedContainer}>
            <FlatList
                contentContainerStyle={[
                    styles.container,
                    processedAttendances.length === 0 && styles.emptyContentContainer,
                ]}
                data={processedAttendances}
                keyExtractor={(item) => `schedule-${item.attendance_id}`}
                renderItem={renderScheduleItem}
                ListEmptyComponent={renderEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#232F40']}
                        tintColor="#232F40"
                    />
                }
                showsVerticalScrollIndicator={false}
                bounces={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={5}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    curvedContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    emptyContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        minHeight: 300,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ScheduleList;
