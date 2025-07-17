// src/components/status/AttendanceInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ScheduleInfo {
  courseName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  instructorName: string;
  date: string;
  chapter: string;
}

type AttendanceInfoCardProps = {
  status: string;
  scheduleInfo: ScheduleInfo;
};

const AttendanceInfoCard: React.FC<AttendanceInfoCardProps> = ({ status, scheduleInfo }) => {
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) { return '-'; }

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) { return '-'; }

    // If timeString is already in HH:MM format, return it as is
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      return timeString;
    }

    // If it's a full ISO datetime, extract the time part
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'PRESENT':
        return 'Hadir Tepat Waktu';
      case 'LATE':
        return 'Hadir Terlambat';
      case 'ABSENT':
        return 'Tidak Hadir';
      case 'ONGOING':
        return 'Sedang Berlangsung';
      case 'NOT_STARTED':
        return 'Belum Dimulai';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'PRESENT':
        return 'checkmark-circle';
      case 'LATE':
        return 'time';
      case 'ABSENT':
        return 'close-circle';
      case 'ONGOING':
        return 'hourglass';
      case 'NOT_STARTED':
        return 'calendar';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'PRESENT':
        return '#4CAF50';
      case 'LATE':
        return '#FFC107';
      case 'ABSENT':
        return '#F44336';
      case 'ONGOING':
        return '#FF9800';
      case 'NOT_STARTED':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.statusSection}>
        <Icon name={getStatusIcon()} size={24} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusMessage()}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mata Kuliah</Text>
            <Text style={styles.infoValue}>{scheduleInfo.courseName || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>{formatDisplayDate(scheduleInfo.date)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ruangan</Text>
            <Text style={styles.infoValue}>{scheduleInfo.roomName || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>
              {formatTime(scheduleInfo.startTime)} - {formatTime(scheduleInfo.endTime)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dosen</Text>
            <Text style={styles.infoValue}>{scheduleInfo.instructorName || '-'}</Text>
          </View>
        </View>

        {scheduleInfo.chapter && (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Materi</Text>
              <Text style={styles.infoValue}>{scheduleInfo.chapter}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AttendanceInfoCard;
