/* eslint-disable react-hooks/rules-of-hooks */
// StatusPresence.tsx with improved image handling
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    ScrollView,
    Alert,
    Text,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// Import components
import StatusHeader from '../components/status/StatusHeader';
import ProfileCard from '../components/status/ProfileCard';
import AttendanceInfoCard from '../components/status/AttendanceInfoCard';

// Import utility functions
import { getStatusColor } from '../utils/statusPresenceUtils';
import { BASE_URL } from '../utils/constants';

type StatusPresenceNavigationProp = StackNavigationProp<RootStackParamList, 'StatusPresence'>;
type StatusPresenceRouteProp = RouteProp<RootStackParamList, 'StatusPresence'>;

type Props = {
    navigation: StatusPresenceNavigationProp;
    route: StatusPresenceRouteProp;
};

const StatusPresence = ({ navigation, route }: Props) => {
    // Handle error if no attendance data is passed
    if (!route.params?.attendance) {
        console.error('No attendance data provided to StatusPresence');
        Alert.alert('Error', 'No attendance data found. Please go back and try again.');
        return null;
    }

    const {
        attendanceId,
        attendance,
        capturedImagePath,
        fromScreen,
    } = route.params;

    console.log('StatusPresence - Received route params:', route.params);
    console.log('Attendance object:', attendance);

    const [pulseAnimValue] = useState(new Animated.Value(0));
    const [showStatusEffect, setShowStatusEffect] = useState(true);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [usingProfileFallback, setUsingProfileFallback] = useState(false);

    // Extract student and attendance details from the attendance object
    // Use safe fallbacks for all values to prevent undefined errors
    const studentName = attendance?.student?.full_name || 'Student';
    const studentNIM = attendance?.student?.nim || 'Unknown NIM';
    const studentProgram = attendance?.student?.major_name || 'Unknown Program';
    const checkInTime = attendance?.check_in_time || '';
    const checkOutTime = attendance?.check_out_time || null;

    // Ensure status has a valid value
    const status = attendance?.status ?
        attendance.status.toUpperCase() :
        (checkInTime ? 'PRESENT' : 'NOT_STARTED');

    // Try to use the server image URL first, then fall back to local path if needed
    const serverImageUrl = attendance?.image_captured_url || null;

    // Function to get profile image URL as fallback
    function getProfileImageUrl(url: string | null | undefined): string {
        if (!url) { return 'https://via.placeholder.com/150'; }
        if (url.startsWith('http')) { return url; }
        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    // Function to format the full image URL - IMPROVED LOGIC
    function getFullImageUrl(url: string | null | undefined): string {
        console.log('Getting image URL for:', url);
        console.log('Image load error:', imageLoadError);
        console.log('Using profile fallback:', usingProfileFallback);

        // If no URL provided at all, use placeholder
        if (!url) {
            console.log('No URL provided, using placeholder');
            return 'https://via.placeholder.com/150';
        }

        // If URL already has http/https, use it directly
        if (url.startsWith('http')) {
            console.log('URL already has http/https, using directly:', url);
            return url;
        }

        // Handle image load error
        if (imageLoadError) {
            // If we're not already using profile as fallback, try with local captured image
            if (!usingProfileFallback && capturedImagePath) {
                console.log('Image load error - trying local captured image:', capturedImagePath);
                return capturedImagePath.startsWith('file://')
                    ? capturedImagePath
                    : `file://${capturedImagePath}`;
            }

            // If we're already using profile fallback or no local image, use profile picture
            if (!usingProfileFallback) {
                console.log('Image load error - using profile picture as fallback');
                setUsingProfileFallback(true);
                return getProfileImageUrl(attendance?.student?.profile_picture_url);
            }

            // Last resort fallback to placeholder
            console.log('All image options failed, using placeholder');
            return 'https://via.placeholder.com/150';
        }

        // Normal case - construct full URL from API base and relative path
        const fullUrl = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        console.log('Constructed full URL:', fullUrl);
        return fullUrl;
    }

    // Get the image URL to display
    const imageUrl = getFullImageUrl(serverImageUrl);

    console.log('Using image URL:', imageUrl);
    console.log('Server image path:', serverImageUrl);
    console.log('Local image path:', capturedImagePath);

    // Create safe scheduleInfo with fallbacks for all values
    const scheduleInfo = {
        courseName: attendance?.schedule?.course?.course_name || 'Unknown Course',
        roomName: attendance?.schedule?.room?.name || 'Unknown Room',
        startTime: attendance?.schedule?.start_time || '--:--',
        endTime: attendance?.schedule?.end_time || '--:--',
        instructorName: attendance?.schedule?.instructor?.full_name || 'Unknown Instructor',
        date: attendance?.schedule?.schedule_date || new Date().toISOString().split('T')[0],
        chapter: attendance?.schedule?.chapter || 'Unknown Chapter',
    };

    console.log('Using schedule info:', scheduleInfo);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });

        // Start animation sequence
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnimValue, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimValue, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Hide pulse effect after 5 seconds
        const timer = setTimeout(() => {
            setShowStatusEffect(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [pulseAnimValue, navigation]);

    const handleGoBack = () => {
        console.log('Navigating back from StatusPresence to:', fromScreen);

        // Add handling for Home screen navigation
        if (fromScreen === 'Home') {
            // Simple back navigation to Home
            navigation.goBack();
            return;
        }

        if (fromScreen === 'CheckIn' || fromScreen === 'Detail') {
            // Navigate to History with the updated attendance
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Main',
                        params: {
                            screen: 'HistoryTab',
                            params: {
                                updatedAttendance: attendance,
                            },
                        },
                    },
                ],
            });
        } else {
            // If coming from History, just go back to the main History tab
            navigation.navigate('Main', {
                screen: 'HistoryTab',
                params: {
                    updatedAttendance: attendance,
                },
            });
        }
    };

    const handleImageError = () => {
        console.log('Error loading image from URL:', imageUrl);

        // If already using profile fallback, don't trigger another error cycle
        if (usingProfileFallback) {
            console.log('Already using profile fallback, not retrying');
            return;
        }

        setImageLoadError(true);
    };

    const pulseScale = pulseAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2],
    });

    const pulseOpacity = pulseAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={getStatusColor(status)} barStyle="light-content" />

            <StatusHeader
                status={status}
                checkOutTime={checkOutTime}
                onBackPress={handleGoBack}
            />

            <View style={[styles.contentWrapper, { backgroundColor: getStatusColor(status) }]}>
                <View style={styles.roundedContainer}>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
                        {/* Use the ProfileCard component with all necessary props */}
                        <ProfileCard
                            studentName={studentName}
                            studentNIM={studentNIM}
                            studentProgram={studentProgram}
                            checkInTime={checkInTime}
                            status={status}
                            imageUrl={imageUrl}
                            showStatusEffect={showStatusEffect}
                            pulseScale={pulseScale}
                            pulseOpacity={pulseOpacity}
                            onImageError={handleImageError}
                        />

                        <AttendanceInfoCard
                            status={status}
                            scheduleInfo={scheduleInfo}
                        />
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentWrapper: {
        flex: 1,
    },
    roundedContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
        overflow: 'hidden',
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 20,
    },
});

export default StatusPresence;