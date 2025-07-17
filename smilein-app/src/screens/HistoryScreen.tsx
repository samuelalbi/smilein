/* eslint-disable react-hooks/exhaustive-deps */
// HistoryScreen.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; // ✅ FIXED: Changed from @react-navigation/navigation
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

// Import components
import HistoryHeader from '../components/detail/history/HistoryHeader';
import FilterControls from '../components/detail/history/FilterControls';
import HistoryList from '../components/detail/history/HistoryList';

// Import API services
import { fetchStudentAttendances, Attendance } from '../services/attendanceApi';

// Import hooks
import { useUserInfo } from '../hooks/useUserInfo';

// Import status helpers
import { getCurrentAttendanceStatus } from '../utils/statusHelpers';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HistoryTab'>;
type HistoryScreenRouteProp = RouteProp<RootStackParamList, 'HistoryTab'>;

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const route = useRoute<HistoryScreenRouteProp>();
  const { token } = useAuth();
  const { userInfo, loading: userLoading, fetchUserData } = useUserInfo();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasFetchedAttendances, setHasFetchedAttendances] = useState(false);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format date for API request - returns YYYY-MM-DD
  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // First useEffect - fetch user data once when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Enhanced function to add computed status to attendances
  const processAttendances = (attendanceList: Attendance[]) => {
    return attendanceList.map(attendance => {
      if (!attendance.schedule?.start_time || !attendance.schedule?.end_time) {
        return attendance;
      }

      const computedStatus = getCurrentAttendanceStatus(
        attendance.status,
        attendance.schedule.start_time,
        attendance.schedule.end_time,
        attendance.check_in_time
      );

      console.log(
        `Processing history attendance ${attendance.attendance_id}: API Status: ${attendance.status}, Computed Status: ${computedStatus}`
      );

      return {
        ...attendance,
        computedStatus, // Add computed status for UI display
      };
    });
  };

  // Sort attendances by date and time
  const sortAttendancesByDateTime = (attendanceList: Attendance[]) => {
    return [...attendanceList].sort((a, b) => {
      // First get the date - either from schedule_date or attendance date
      const getDateFromAttendance = (att: Attendance) => {
        const dateStr = att.schedule?.schedule_date || att.date || '';
        const timeStr = att.schedule?.start_time || '00:00:00';

        if (!dateStr) { return new Date(0); } // default for invalid data

        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes, seconds || 0);
      };

      const dateA = getDateFromAttendance(a);
      const dateB = getDateFromAttendance(b);

      // Sort newest first (descending)
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Enhanced filter function for completed attendances
  const filterCompletedAttendances = (attendanceList: Attendance[]) => {
    const currentTime = new Date();
    console.log('Current time:', currentTime.toLocaleString());
    console.log('Total attendances before filtering:', attendanceList.length);

    const filtered = attendanceList.filter(attendance => {
      // Skip invalid data
      if (!attendance || !attendance.schedule || !attendance.schedule.end_time) {
        console.log('Skipping attendance due to missing data:', attendance?.attendance_id);
        return false;
      }

      // Parse end time (format "18:15:00")
      const endTimeString = attendance.schedule.end_time;
      const [hours, minutes, seconds] = endTimeString.split(':').map(Number);

      // Determine schedule date
      let scheduleDate: Date;

      if (attendance.schedule.schedule_date) {
        // Format schedule date: "YYYY-MM-DD"
        const [year, month, day] = attendance.schedule.schedule_date.split('-').map(Number);
        scheduleDate = new Date(year, month - 1, day);
      } else if (attendance.date) {
        // Format attendance date: "YYYY-MM-DD"
        const [year, month, day] = attendance.date.split('-').map(Number);
        scheduleDate = new Date(year, month - 1, day);
      } else {
        // Fallback to today
        scheduleDate = new Date();
        scheduleDate.setHours(0, 0, 0, 0);
      }

      // Set end time on schedule date
      const endTimeDate = new Date(
        scheduleDate.getFullYear(),
        scheduleDate.getMonth(),
        scheduleDate.getDate(),
        hours,
        minutes,
        seconds || 0
      );

      // For date filtering
      const selectedDateMatch = selectedDate ? isSameDay(scheduleDate, selectedDate) : true;

      // Get current date without time for comparison
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Check if schedule date is in the past OR if it's today and end time has passed
      const isPastSchedule = scheduleDate < currentDate;
      const isTodayButEnded =
        isSameDay(scheduleDate, currentDate) && currentTime > endTimeDate;

      const shouldShow = (isPastSchedule || isTodayButEnded) && selectedDateMatch;

      console.log(
        `Attendance ${attendance.attendance_id} - Schedule date: ${scheduleDate.toDateString()}, End time: ${endTimeString}, ` +
        `End time date: ${endTimeDate.toLocaleString()}, Current time: ${currentTime.toLocaleString()}, ` +
        `Date filter match: ${selectedDateMatch}, Past schedule: ${isPastSchedule}, Today but ended: ${isTodayButEnded}, Should show: ${shouldShow}`
      );

      // Only show if (schedule is in the past OR today but ended) AND matches selected date filter
      return shouldShow;
    });

    console.log('Total attendances after filtering:', filtered.length);

    // Process attendances with computed status
    const processedFiltered = processAttendances(filtered);

    // Sort filtered attendances from newest to oldest
    const sortedAttendances = sortAttendancesByDateTime(processedFiltered);

    // Limit to 10 most recent attendances if no date filter is applied
    if (!selectedDate && sortedAttendances.length > 10) {
      console.log('No date selected - limiting to 10 most recent attendances');
      return sortedAttendances.slice(0, 10);
    }

    return sortedAttendances;
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Fetch attendances
  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      if (!token) {
        console.error('No auth token available');
        return;
      }

      if (!userInfo?.student_id) {
        console.error('User info or student ID not available');
        return;
      }

      console.log('Fetching attendance history for student ID:', userInfo.student_id);
      console.log('Selected date filter:', selectedDate ? formatDateForApi(selectedDate) : 'All dates');

      // Use date filter only if a date is selected
      const dateFilter = selectedDate ? formatDateForApi(selectedDate) : undefined;
      const data = await fetchStudentAttendances(token, userInfo.student_id, dateFilter);

      console.log('Attendance history fetched:', data ? data.length : 0);
      setAttendances(data || []);

      // Apply completed attendances filter, sort, and limit if needed
      const filtered = filterCompletedAttendances(data || []);
      setFilteredAttendances(filtered);

      setHasFetchedAttendances(true);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendances when userInfo changes
  useEffect(() => {
    if (userInfo?.student_id) {
      fetchAttendanceHistory();
    }
  }, [userInfo?.student_id, selectedDate]);

  // Re-filter attendances every minute
  useEffect(() => {
    // Filter when attendances change
    const filtered = filterCompletedAttendances(attendances);
    setFilteredAttendances(filtered);

    // Set interval to check every minute
    const intervalId = setInterval(() => {
      console.log('Refiltering attendances based on current time');
      const newFiltered = filterCompletedAttendances(attendances);
      setFilteredAttendances(newFiltered);
    }, 60000); // Check every minute

    return () => clearInterval(intervalId); // ✅ CLEANUP
  }, [attendances, selectedDate]);

  // Handle navigation focus and updated attendance data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh data when screen is focused
      if (userInfo?.student_id) {
        fetchAttendanceHistory();
      }

      // Update specific attendance if passed from another screen
      if (route.params?.updatedAttendance) {
        const updatedAttendance = route.params.updatedAttendance;

        // Process the updated attendance
        const processedUpdated = processAttendances([updatedAttendance])[0];

        setAttendances(prevAttendances =>
          prevAttendances.map(attendance =>
            attendance.attendance_id === updatedAttendance.attendance_id
              ? processedUpdated
              : attendance
          )
        );

        navigation.setParams({
          updatedAttendance: undefined,
        });
      }
    });

    return unsubscribe;
  }, [navigation, route.params, userInfo?.student_id]);

  // Fixed: Handle date change with proper event type checking
  const handleDateChange = (event: any, date?: Date) => {
    setShowCalendar(false);

    // Only set the date if user pressed OK (not Cancel)
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
    // If event.type === 'dismissed' (Cancel pressed), do nothing
  };

  const resetDateFilter = () => {
    setSelectedDate(null);
  };

  const handleScheduleCardPress = (attendance: Attendance) => {
    if (isNavigating) { return; }
    setIsNavigating(true);

    // Get the current computed status
    const currentStatus = (attendance as any).computedStatus || getCurrentAttendanceStatus(
      attendance.status,
      attendance.schedule?.start_time || '',
      attendance.schedule?.end_time || '',
      attendance.check_in_time
    );

    console.log(`History: Navigating with attendance ${attendance.attendance_id}, status: ${currentStatus}`);

    // Navigate to StatusPresence with complete attendance data
    navigation.navigate('StatusPresence', {
      attendanceId: attendance.attendance_id,
      attendance: attendance, // Pass the entire attendance object
      fromScreen: 'History',
    });

    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchAttendanceHistory();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#232F40" barStyle="light-content" />

      {/* Fixed Header */}
      <View style={styles.fixedContent}>
        <HistoryHeader
          selectedDate={selectedDate}
          formatDate={formatDate}
        />
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.curvedContainer}>
          <FilterControls
            selectedDate={selectedDate}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            handleDateChange={handleDateChange}
            resetDateFilter={resetDateFilter}
          />

          {/* Use HistoryList for displaying filtered history */}
          <HistoryList
            attendances={filteredAttendances}
            onSchedulePress={handleScheduleCardPress}
            isLoading={loading || userLoading}
            onRefresh={handleRefresh}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#232F40',
  },
  fixedContent: {
    backgroundColor: '#232F40',
    zIndex: 1,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
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
});

export default HistoryScreen;