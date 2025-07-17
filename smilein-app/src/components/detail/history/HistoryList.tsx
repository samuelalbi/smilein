import React from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import ScheduleCard from '../../ScheduleCard';
import { Attendance } from '../../../services/attendanceApi';
import { getCurrentAttendanceStatus } from '../../../utils/statusHelpers';

interface HistoryListProps {
  attendances: Attendance[];
  onSchedulePress: (attendance: Attendance) => void;
  isLoading: boolean;
  onRefresh?: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  attendances,
  onSchedulePress,
  isLoading,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState<number | null>(null);

  const handleRefresh = React.useCallback(() => {
    if (onRefresh) {
      setRefreshing(true);
      onRefresh();
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  }, [onRefresh]);

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

        console.log(`HistoryList: Processing attendance ${attendance.attendance_id} - API Status: ${attendance.status}, Computed: ${computedStatus}`);

        return {
          ...attendance,
          computedStatus,
        };
      }

      return attendance;
    });
  }, [attendances]);

  // Show loading indicator when loading
  if (isLoading && !refreshing && processedAttendances.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#232F40" />
        <Text style={styles.loadingText}>Memuat riwayat absensi...</Text>
      </View>
    );
  }

  // Show message when no attendance records
  if (!processedAttendances || processedAttendances.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainerScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#232F40']}
            tintColor="#232F40"
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Tidak ada riwayat presensi yang sudah selesai
          </Text>
          <Text style={styles.emptySubText}>
            Hanya kelas yang telah berakhir akan muncul di sini
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Render attendance list
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#232F40']}
          tintColor="#232F40"
        />
      }
      bounces={true}
    >
      {/* The attendances array is already sorted in HistoryScreen */}
      {processedAttendances.map((attendance) => {
        // Verify attendance has valid data
        if (!attendance || !attendance.attendance_id) {
          console.warn('Invalid attendance object in history list');
          return null;
        }

        return (
          <ScheduleCard
            key={`history-${attendance.attendance_id}-${attendance.date}`}
            attendance={attendance}
            onPress={() => handleSchedulePress(attendance)}
          />
        );
      })}
      <View style={styles.scrollPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainerScroll: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollPadding: {
    height: 30,
  },
});

export default HistoryList;
