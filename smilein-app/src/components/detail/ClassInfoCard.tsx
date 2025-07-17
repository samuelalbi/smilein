/* eslint-disable react-native/no-inline-styles */
// src/components/detail/ClassInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Attendance } from '../../services/attendanceApi';
import {
  getStatusColor,
  getStatusText,
  getActionButtonColor,
  getActionIcon,
  getActionText,
  getCurrentAttendanceStatus,
  canTakeAttendanceAction,
} from '../../utils/statusHelpers';

// Define button status info type
type ButtonStatusInfo = {
  text: string;
  subtext: string;
  type: 'loading' | 'time' | 'location' | 'location_error' | 'status' | 'ready';
};

type ClassInfoCardProps = {
  attendance: Attendance;
  canAttend: boolean;
  onAttendPress: () => void;
  isInLocation: boolean;
  locationOverride?: boolean;
  onToggleLocationOverride?: () => void;
  isCheckingLocation?: boolean;
  locationError?: string | null;
  onRetryLocation?: () => void;
  buttonStatusInfo?: ButtonStatusInfo;
  isButtonDisabled?: boolean;
};

const ClassInfoCard: React.FC<ClassInfoCardProps> = ({
  attendance,
  canAttend,
  onAttendPress,
  isInLocation,
  locationOverride = false,
  isCheckingLocation = false,
  locationError = null,
  onRetryLocation,
  buttonStatusInfo,
  isButtonDisabled = false,
}) => {
  // Extract schedule data from attendance object
  const { schedule, status: apiStatus, check_in_time } = attendance;
  const { start_time, end_time, room, instructor } = schedule;

  // Get current attendance status using enhanced logic
  const displayStatus = getCurrentAttendanceStatus(
    apiStatus,
    start_time,
    end_time,
    check_in_time
  );

  // Check if attendance action is allowed
  const canTakeAction = canTakeAttendanceAction(displayStatus);

  // Button should always show for active states unless explicitly completed
  const shouldShowButton = canTakeAction;

  // Get button color based on status info
  const getButtonColor = () => {
    if (!buttonStatusInfo) { return getActionButtonColor(displayStatus); }

    switch (buttonStatusInfo.type) {
      case 'loading':
        return '#9E9E9E';
      case 'time':
        return '#FF9800';
      case 'location':
      case 'location_error':
        return '#F44336';
      case 'status':
        return '#9E9E9E';
      case 'ready':
        return getActionButtonColor(displayStatus);
      default:
        return getActionButtonColor(displayStatus);
    }
  };

  // Get button icon based on status info
  const getButtonIcon = () => {
    if (!buttonStatusInfo) { return getActionIcon(displayStatus); }

    switch (buttonStatusInfo.type) {
      case 'loading':
        return 'location-outline';
      case 'time':
        return 'time-outline';
      case 'location':
      case 'location_error':
        return 'location-outline';
      case 'status':
        return 'information-circle-outline';
      case 'ready':
        return getActionIcon(displayStatus);
      default:
        return getActionIcon(displayStatus);
    }
  };

  // Debug log
  console.log(`ClassInfoCard - API Status: ${apiStatus}, Display Status: ${displayStatus}, Can Take Action: ${canTakeAction}`);
  console.log(`ClassInfoCard - canAttend: ${canAttend}, isInLocation: ${isInLocation}, locationOverride: ${locationOverride}`);
  console.log('ClassInfoCard - buttonStatusInfo:', buttonStatusInfo);

  return (
    <View style={styles.card}>
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Informasi Kelas</Text>

        <View style={styles.infoRow}>
          <Icon name="time-outline" size={20} color="#232F40" />
          <Text style={styles.infoLabel}>Waktu:</Text>
          <Text style={styles.infoValue}>{start_time} - {end_time} WIB</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-outline" size={20} color="#232F40" />
          <Text style={styles.infoLabel}>Ruangan:</Text>
          <Text style={styles.infoValue}>{room.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="person-outline" size={20} color="#232F40" />
          <Text style={styles.infoLabel}>Dosen:</Text>
          <Text style={styles.infoValue}>{instructor.full_name}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(displayStatus) },
          ]}>
            <Text style={styles.statusText}>{getStatusText(displayStatus)}</Text>
          </View>
        </View>

        {/* Enhanced Location Status - Only show if action can be taken */}
        {shouldShowButton && (
          <View style={[
            styles.locationStatusContainer,
            {
              backgroundColor: buttonStatusInfo?.type === 'location_error' ? '#FFF3F0' :
                isCheckingLocation ? '#F0F8FF' : '#F8F8F8',
            },
          ]}>
            {isCheckingLocation ? (
              <>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.checkingLocationText}>
                  Mencari lokasi Anda...
                </Text>
              </>
            ) : (
              <>
                <Icon
                  name={(isInLocation || locationOverride) ? 'location' : 'location-outline'}
                  size={20}
                  color={(isInLocation || locationOverride) ? '#4CAF50' : '#F44336'}
                />
                <Text style={[
                  styles.locationStatusText,
                  { color: (isInLocation || locationOverride) ? '#4CAF50' : '#F44336' },
                ]}>
                  {(isInLocation || locationOverride)
                    ? locationOverride
                      ? 'Override Lokasi Aktif (Mode Testing)'
                      : 'Anda berada di lokasi kelas'
                    : locationError
                      ? `Gagal mendapatkan lokasi: ${locationError}`
                      : 'Anda tidak berada di lokasi kelas'}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Error Recovery Buttons */}
        {locationError && onRetryLocation && shouldShowButton && !isCheckingLocation && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetryLocation}
          >
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>
              Coba Periksa Lokasi Lagi
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* Enhanced Attendance Action Button */}
      {shouldShowButton && (
        <>
          <TouchableOpacity
            style={[
              styles.attendanceButton,
              {
                backgroundColor: getButtonColor(),
                opacity: isButtonDisabled ? 0.6 : 1,
              },
            ]}
            onPress={onAttendPress}
            disabled={isButtonDisabled}
          >
            {isCheckingLocation && buttonStatusInfo?.type === 'loading' ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.attendanceButtonText}>
                  {buttonStatusInfo?.text || 'Mencari Lokasi...'}
                </Text>
              </>
            ) : (
              <>
                <Icon name={getButtonIcon()} size={20} color="#fff" />
                <Text style={styles.attendanceButtonText}>
                  {buttonStatusInfo?.text || getActionText(displayStatus)}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Enhanced Button Status Information */}
          {buttonStatusInfo && buttonStatusInfo.subtext && (
            <View style={[
              styles.buttonStatusContainer,
              {
                backgroundColor: buttonStatusInfo.type === 'ready' ? '#E8F5E8' :
                  buttonStatusInfo.type === 'loading' ? '#F0F8FF' :
                    buttonStatusInfo.type === 'time' ? '#FFF8E1' :
                      '#FFEBEE',
              },
            ]}>
              <Icon
                name={
                  buttonStatusInfo.type === 'ready' ? 'checkmark-circle' :
                    buttonStatusInfo.type === 'loading' ? 'time' :
                      buttonStatusInfo.type === 'time' ? 'time-outline' :
                        'information-circle'
                }
                size={16}
                color={
                  buttonStatusInfo.type === 'ready' ? '#4CAF50' :
                    buttonStatusInfo.type === 'loading' ? '#2196F3' :
                      buttonStatusInfo.type === 'time' ? '#FF9800' :
                        '#F44336'
                }
              />
              <Text style={[
                styles.buttonStatusText,
                {
                  color: buttonStatusInfo.type === 'ready' ? '#2E7D32' :
                    buttonStatusInfo.type === 'loading' ? '#1976D2' :
                      buttonStatusInfo.type === 'time' ? '#F57C00' :
                        '#C62828',
                },
              ]}>
                {buttonStatusInfo.subtext}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Status Information for completed attendance */}
      {(displayStatus === 'PRESENT' || displayStatus === 'LATE') && (
        <View style={styles.attendanceInfoContainer}>
          <Icon name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.attendanceInfoText}>
            Anda telah melakukan absensi pada {check_in_time}
          </Text>
        </View>
      )}

      {/* Status Information for absent */}
      {displayStatus === 'ABSENT' && (
        <View style={styles.attendanceInfoContainer}>
          <Icon name="close-circle" size={20} color="#F44336" />
          <Text style={styles.attendanceInfoText}>
            Anda tidak melakukan absensi pada mata kuliah ini
          </Text>
        </View>
      )}

      {/* Status Information for not started */}
      {displayStatus === 'NOT_STARTED' && !shouldShowButton && (
        <View style={styles.attendanceInfoContainer}>
          <Icon name="time-outline" size={20} color="#9E9E9E" />
          <Text style={styles.attendanceInfoText}>
            Kelas belum dimulai. Anda dapat melakukan absensi 15 menit sebelum kelas dimulai.
          </Text>
        </View>
      )}

      {/* Status Information for ready to check in */}
      {displayStatus === 'READY_TO_CHECKIN' && !shouldShowButton && (
        <View style={styles.attendanceInfoContainer}>
          <Icon name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.attendanceInfoText}>
            Anda sudah dapat melakukan check-in untuk kelas ini.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232F40',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 15,
    color: '#666',
    width: 60,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  locationStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checkingLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#232F40',
    padding: 15,
    borderRadius: 8,
    marginTop: 16,
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonStatusText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  overrideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  overrideButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  attendanceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginTop: 16,
  },
  attendanceInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#1976D2',
    borderRadius: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
});

export default ClassInfoCard;
