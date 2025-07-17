/* eslint-disable react-hooks/exhaustive-deps */
// Modified HomeScreen.tsx with enhanced status logic - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Import types
import { RootStackParamList } from '../types/navigation';
import { Attendance } from '../services/attendanceApi';

// Import components
import HomeHeader from '../components/HomeHeader';
import ScheduleList from '../components/ScheduleList';
import LogoutModal from '../components/LogoutModal';

// Import API services
import { fetchStudentAttendances } from '../services/attendanceApi';

// Import hooks
import { useUserInfo } from '../hooks/useUserInfo';

// Import status helpers
import { getCurrentAttendanceStatus } from '../utils/statusHelpers';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const route = useRoute<HomeScreenRouteProp>();
    const { logout, token } = useAuth();

    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasFetchedAttendances, setHasFetchedAttendances] = useState(false);

    const { userInfo, loading: userLoading, fetchUserData, fetchProfilePicture } = useUserInfo();

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Log the current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toLocaleString();
    };

    // ✅ FIXED: Enhanced function to determine if attendance should be shown on home screen
    const shouldShowAttendance = (attendance: Attendance) => {
        const currentTime = new Date();
        const todayDate = getTodayDate();

        // Get schedule date from the nested schedule object
        const scheduleDate = attendance.schedule?.schedule_date;

        if (!scheduleDate || !attendance.schedule?.start_time || !attendance.schedule?.end_time) {
            console.log(`Attendance ${attendance.attendance_id} - Missing schedule data`);
            return false;
        }

        // Check if it's for today
        const isForToday = scheduleDate === todayDate;

        console.log(
            `Attendance ${attendance.attendance_id} - Schedule date: ${scheduleDate}, Today: ${todayDate}, IsToday: ${isForToday}`
        );

        // Only show schedules for TODAY on the home screen
        if (!isForToday) {
            console.log(`Attendance ${attendance.attendance_id} - Not for today, won't show on home screen`);
            return false;
        }

        // Get the current status using our enhanced logic
        const currentStatus = getCurrentAttendanceStatus(
            attendance.status,
            attendance.schedule.start_time,
            attendance.schedule.end_time,
            attendance.check_in_time
        );

        // Parse end time to check if class ended recently
        const [endHours, endMinutes] = attendance.schedule.end_time.split(':').map(Number);
        const endTimeMinutes = endHours * 60 + endMinutes;
        const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const minutesSinceEnd = currentTimeMinutes - endTimeMinutes;

        // ✅ FIXED: Show attendance if:
        // 1. Status is not ABSENT (active/upcoming classes)
        // 2. Status is ABSENT but class ended less than 2 hours ago (recently ended)
        // 3. User has already checked in (PRESENT/LATE with check_in_time)
        let shouldShow = false;

        if (currentStatus !== 'ABSENT') {
            // Show all non-absent statuses
            shouldShow = true;
        } else if (currentStatus === 'ABSENT' && minutesSinceEnd < 120) {
            // Show recently ended classes (less than 2 hours ago)
            shouldShow = true;
        } else if (attendance.check_in_time) {
            // Always show if user has checked in
            shouldShow = true;
        }

        console.log(
            `Attendance ${attendance.attendance_id} - Current Status: ${currentStatus}, ` +
            `Minutes since end: ${minutesSinceEnd}, Has check-in: ${!!attendance.check_in_time}, ` +
            `Should Show: ${shouldShow}`
        );

        return shouldShow;
    };

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
                `Processing attendance ${attendance.attendance_id}: API Status: ${attendance.status}, ` +
                `Computed Status: ${computedStatus}, Check-in: ${attendance.check_in_time}`
            );

            return {
                ...attendance,
                computedStatus, // Add computed status for UI display
            };
        });
    };

    // Fetch all attendances then filter for today
    const fetchTodayAttendances = async () => {
        try {
            if (!token) {
                console.error('No auth token available');
                return;
            }

            if (!userInfo?.student_id) {
                console.error('User info or student ID not available');
                return;
            }

            setLoading(true);
            console.log('Fetching attendances for student ID:', userInfo.student_id);
            console.log('Current date and time:', getCurrentDateTime());

            // Fetch all attendances
            const data = await fetchStudentAttendances(token, userInfo.student_id);

            console.log('Total fetched attendances:', data ? data.length : 0);

            if (!data || data.length === 0) {
                console.log('No attendance data returned from API');
                setAttendances([]);
                setHasFetchedAttendances(true);
                setLoading(false);
                return;
            }

            // Log each attendance that was fetched
            data.forEach(attendance => {
                console.log(
                    `Fetched attendance ${attendance.attendance_id}:` +
                    ` Date: ${attendance.date},` +
                    ` Schedule date: ${attendance.schedule?.schedule_date},` +
                    ` Start: ${attendance.schedule?.start_time},` +
                    ` End: ${attendance.schedule?.end_time},` +
                    ` Status: ${attendance.status},` +
                    ` Check-in: ${attendance.check_in_time}`
                );
            });

            // Process attendances with computed status
            const processedAttendances = processAttendances(data);

            // Filter for today's attendances
            const todayAttendances = processedAttendances.filter(attendance => shouldShowAttendance(attendance));

            console.log('Today\'s attendances filtered:', todayAttendances.length);

            // Log each today's attendance that passed the filter
            todayAttendances.forEach(attendance => {
                console.log(
                    `Today's attendance ${attendance.attendance_id}:` +
                    ` Date: ${attendance.date},` +
                    ` Schedule date: ${attendance.schedule?.schedule_date},` +
                    ` Start: ${attendance.schedule?.start_time},` +
                    ` End: ${attendance.schedule?.end_time},` +
                    ` API Status: ${attendance.status},` +
                    ` Computed Status: ${(attendance as any).computedStatus},` +
                    ` Check-in: ${attendance.check_in_time}`
                );
            });

            // Sort by start time
            const sortedAttendances = todayAttendances.sort((a, b) => {
                const timeA = a.schedule?.start_time || '00:00';
                const timeB = b.schedule?.start_time || '00:00';
                return timeA.localeCompare(timeB);
            });

            setAttendances(sortedAttendances);
            setHasFetchedAttendances(true);
        } catch (error) {
            console.error('Error fetching attendances:', error);
        } finally {
            setLoading(false);
        }
    };

    // First useEffect - fetch user data and profile picture when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            console.log('HomeScreen: Loading user data...');
            try {
                // Fetch user data first
                await fetchUserData();
                // Then fetch profile picture separately to ensure it's loaded
                await fetchProfilePicture();
                console.log('HomeScreen: User data and profile picture loaded successfully');
            } catch (error) {
                console.error('HomeScreen: Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    // Second useEffect - fetch attendances only when userInfo changes and has student_id
    useEffect(() => {
        if (userInfo?.student_id && !hasFetchedAttendances) {
            fetchTodayAttendances();
        }
    }, [userInfo?.student_id, hasFetchedAttendances]);

    // Third useEffect - for the navigation focus listener
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh profile picture when screen comes into focus
            console.log('HomeScreen: Screen focused, refreshing profile picture...');
            fetchProfilePicture();

            // Only refresh attendances if we already have user data
            if (userInfo?.student_id) {
                fetchTodayAttendances();
            }

            if (route.params?.updatedAttendance) {
                const updatedAttendance = route.params.updatedAttendance;
                console.log('Received updated attendance:', updatedAttendance);

                // Process the updated attendance
                const processedUpdated = processAttendances([updatedAttendance])[0];

                // Only update if the attendance is for today
                if (shouldShowAttendance(processedUpdated)) {
                    // Update the local state with the updated attendance
                    setAttendances(prevAttendances =>
                        prevAttendances.map(attendance =>
                            attendance.attendance_id === updatedAttendance.attendance_id
                                ? processedUpdated
                                : attendance
                        )
                    );
                } else {
                    // Remove from list if it shouldn't be shown anymore
                    setAttendances(prevAttendances =>
                        prevAttendances.filter(attendance =>
                            attendance.attendance_id !== updatedAttendance.attendance_id
                        )
                    );
                }

                // Clear the params to avoid duplicate updates
                navigation.setParams({
                    updatedAttendance: undefined,
                });
            }
        });

        return unsubscribe;
    }, [navigation, route.params, userInfo?.student_id]);

    // Fourth useEffect - for tab bar visibility
    useEffect(() => {
        const parent = navigation.getParent();

        if (isLogoutModalVisible) {
            parent?.setOptions({
                tabBarStyle: { display: 'none' },
            });
        } else {
            parent?.setOptions({
                tabBarStyle: {
                    display: 'flex',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    height: 60,
                },
            });
        }

        return () => {
            parent?.setOptions({
                tabBarStyle: {
                    display: 'flex',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    height: 60,
                },
            });
        };
    }, [isLogoutModalVisible, navigation]);

    // Fifth useEffect - refresh status every minute
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('HomeScreen: Refreshing attendance statuses...');
            if (attendances.length > 0) {
                const refreshedAttendances = processAttendances(attendances);
                const filteredAttendances = refreshedAttendances.filter(attendance => shouldShowAttendance(attendance));
                setAttendances(filteredAttendances);
            }
        }, 60000); // Refresh every minute

        return () => clearInterval(interval); // ✅ CLEANUP
    }, [attendances]);

    const handleLogoutPress = () => {
        setLogoutModalVisible(true);
    };

    const handleCloseModal = () => {
        setLogoutModalVisible(false);
    };

    const handleLogout = () => {
        logout();
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

        console.log(`Navigating with attendance ${attendance.attendance_id}, status: ${currentStatus}`);

        // Check if attendance has already been marked (PRESENT or LATE)
        if (currentStatus === 'PRESENT' || currentStatus === 'LATE') {
            console.log(`Navigating to StatusPresence with ${currentStatus} attendance:`, attendance.attendance_id);

            // Navigate to StatusPresence directly since the student has already checked in
            navigation.navigate('StatusPresence', {
                attendanceId: attendance.attendance_id,
                attendance: attendance,
                capturedImagePath: null, // No captured image path from home screen
                fromScreen: 'Home',
            });
        } else {
            console.log('Navigating to DetailScreen with attendance:', attendance.attendance_id);

            // Navigate to DetailScreen as usual for not-checked-in attendances
            navigation.navigate('Detail', {
                attendance: attendance,
                fromScreen: 'Home',
            });
        }

        setTimeout(() => {
            setIsNavigating(false);
        }, 1000);
    };

    // Add console log to debug profile picture
    console.log('HomeScreen render - Profile picture URL:', userInfo?.profile_picture_url, 'User loading:', userLoading);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                backgroundColor="#232F40"
                barStyle="light-content"
            />

            {/* Fixed Header Content */}
            <View style={styles.fixedContent}>
                <HomeHeader
                    userName={userInfo?.full_name || 'Loading...'}
                    avatarUrl={userInfo?.profile_picture_url || ''}
                    isApproved={userInfo?.is_approved || false}
                    onProfilePress={() => navigation.navigate('ProfileSettings')}
                    onLogoutPress={handleLogoutPress}
                />
            </View>

            {/* Schedule List */}
            <View style={styles.contentWrapper}>
                <ScheduleList
                    attendances={attendances}
                    onSchedulePress={handleScheduleCardPress}
                    isLoading={loading || userLoading}
                    onRefresh={fetchTodayAttendances}
                />
            </View>

            {/* Logout Modal */}
            <LogoutModal
                visible={isLogoutModalVisible}
                onClose={handleCloseModal}
                onLogout={handleLogout}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
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
});

export default HomeScreen;