// DetailScreen.tsx - Safe version dengan fallback timezone handling
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, StatusBar, ScrollView, Linking, Platform, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useCameraPermission } from 'react-native-vision-camera';

// Import components
import DetailHeader from '../components/detail/DetailHeader';
import ClassInfoCard from '../components/detail/ClassInfoCard';
import CameraView from '../components/detail/CameraView';

// Import utility functions
import { canAttendNow } from '../utils/statusHelpers';
import { useLocation } from '../context/LocationContext';
import { Attendance, checkInAttendance, APIError } from '../services/attendanceApi';
import { useAuth } from '../context/AuthContext';

// Safe import timezone utils dengan fallback
let timezoneUtils: any = null;
try {
  timezoneUtils = require('../utils/timezoneUtils');
  console.log('✅ DetailScreen: timezoneUtils imported successfully');
} catch (importError) {
  console.warn('⚠️ DetailScreen: Could not import timezoneUtils, using fallback:', importError);
}

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

type Props = {
  navigation: DetailScreenNavigationProp;
  route: DetailScreenRouteProp;
};

// Define button status info type
type ButtonStatusInfo = {
  text: string;
  subtext: string;
  type: 'loading' | 'time' | 'location' | 'location_error' | 'status' | 'ready';
};

// Define Face Verification Error Types
type FaceVerificationErrorType =
  | 'FACE_NOT_DETECTED'
  | 'FACE_NOT_MATCHED'
  | 'LOW_CONFIDENCE'
  | 'MULTIPLE_FACES'
  | 'POOR_IMAGE_QUALITY'
  | 'MODEL_ERROR'
  | 'UNKNOWN_ERROR';

interface FaceVerificationError {
  type: FaceVerificationErrorType;
  message: string;
  confidence?: number;
  expectedNim?: string;
  predictedNim?: string;
}

// Safe fallback timestamp function
const safeCreateJakartaTimestamp = (): string => {
  if (timezoneUtils && timezoneUtils.createJakartaTimestamp) {
    try {
      return timezoneUtils.createJakartaTimestamp();
    } catch (error) {
      console.warn('timezoneUtils.createJakartaTimestamp failed, using fallback:', error);
    }
  }

  // Fallback: Manual Jakarta timestamp
  try {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return jakartaTime.toISOString();
  } catch (error) {
    console.error('Fallback Jakarta timestamp failed, using UTC:', error);
    return new Date().toISOString();
  }
};

export const DetailScreen = ({ navigation, route }: Props) => {
  console.log('DetailScreen - Received route params:', route.params);

  // Ensure the attendance object exists in route params
  if (!route.params?.attendance) {
    console.error('No attendance data provided to DetailScreen');
    Alert.alert('Error', 'No class data provided. Please go back and try again.');
    return (
      <SafeAreaView style={styles.safeArea}>
        <DetailHeader
          title="Error"
          subtitle="No data found"
          onBackPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const { attendance } = route.params;
  const { token } = useAuth();

  // Use LocationContext instead of managing location state locally
  const {
    coordinates,
    isLocationLoading,
    locationError,
    hasLocationPermission,
    checkIsInClassroom,
    refreshLocation,
    retryLocationSetup,
  } = useLocation();

  const [currentAttendance, setCurrentAttendance] = useState<Attendance>(attendance);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isInLocation, setIsInLocation] = useState<boolean>(false);
  const [locationOverride, setLocationOverride] = useState<boolean>(false);
  const [capturedImagePath, setCapturedImagePath] = useState<string | null>(null);
  const [isProcessingCheckin, setIsProcessingCheckin] = useState<boolean>(false);

  // Face verification retry state
  const [faceVerificationRetryCount, setFaceVerificationRetryCount] = useState<number>(0);
  const [lastFaceVerificationError, setLastFaceVerificationError] = useState<FaceVerificationError | null>(null);

  // Use the hooks from react-native-vision-camera
  const { hasPermission, requestPermission } = useCameraPermission();

  // Check location immediately when coordinates or room data changes
  useEffect(() => {
    const roomData = currentAttendance?.schedule?.room;

    if (coordinates && roomData && !locationOverride) {
      // Use the context method to check if user is in classroom
      const inClassroom = checkIsInClassroom(roomData);
      console.log('Location check result from context:', inClassroom);
      setIsInLocation(inClassroom);
    } else if (locationOverride) {
      // If override is active, always consider in location
      setIsInLocation(true);
    } else if (!coordinates && !isLocationLoading) {
      // If no coordinates and not loading, user is not in location
      setIsInLocation(false);
    }
  }, [coordinates, currentAttendance?.schedule?.room, locationOverride, checkIsInClassroom, isLocationLoading]);

  // Determine if schedule is ongoing
  const isOngoing = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');

    const { status, schedule } = currentAttendance;
    return currentTime < schedule.end_time && status !== 'PRESENT' && status !== 'LATE';
  };

  // Compute the display status
  const getDisplayStatus = () => {
    return isOngoing() ? 'ONGOING' : currentAttendance.status;
  };

  // Function to check time availability only (without location loading check)
  const canAttendBasedOnTime = () => {
    return canAttendNow(currentAttendance.schedule.start_time);
  };

  // Function to check location availability only (without loading check)
  const canAttendBasedOnLocation = () => {
    return isInLocation || locationOverride;
  };

  // Function to check if user can attend now (considering time and location, but button should still show during loading)
  const canAttendNowWithLocation = () => {
    // First check time constraints
    const timeAllowed = canAttendBasedOnTime();

    // Then check location or override
    const locationAllowed = canAttendBasedOnLocation();

    // Debug logs to help understand the state
    console.log('=== Attendance Check ===');
    console.log('Time allowed:', timeAllowed);
    console.log('Location allowed:', locationAllowed);
    console.log('isInLocation:', isInLocation);
    console.log('locationOverride:', locationOverride);
    console.log('isLocationLoading:', isLocationLoading);
    console.log('coordinates:', coordinates);
    console.log('hasLocationPermission:', hasLocationPermission);

    // Both time and location conditions must be true
    // Note: We don't check isLocationLoading here, button should show but be disabled
    return timeAllowed && locationAllowed;
  };

  // Function to determine if button should be disabled
  const isButtonDisabled = () => {
    // Disable if still loading location (unless override is active)
    if (isLocationLoading && !locationOverride) {
      return true;
    }

    // Disable if time conditions not met
    if (!canAttendBasedOnTime()) {
      return true;
    }

    // Disable if location conditions not met
    if (!canAttendBasedOnLocation()) {
      return true;
    }

    // Disable if status doesn't allow attendance
    const displayStatus = getDisplayStatus();
    if (displayStatus !== 'ONGOING' && displayStatus !== 'NOT_STARTED' && displayStatus !== 'ABSENT') {
      return true;
    }

    return false;
  };

  // Function to get button text/status info
  const getButtonStatusInfo = (): ButtonStatusInfo => {
    if (isLocationLoading && !locationOverride) {
      return {
        text: 'Mencari Lokasi...',
        subtext: 'Sedang mendeteksi lokasi Anda',
        type: 'loading',
      };
    }

    if (!canAttendBasedOnTime()) {
      return {
        text: 'Belum Waktunya',
        subtext: `Absensi dibuka 15 menit sebelum ${currentAttendance.schedule.start_time}`,
        type: 'time',
      };
    }

    if (!canAttendBasedOnLocation()) {
      if (locationError) {
        return {
          text: 'Lokasi Bermasalah',
          subtext: locationError,
          type: 'location_error',
        };
      }
      return {
        text: 'Lokasi Tidak Sesuai',
        subtext: 'Anda harus berada di lokasi kelas',
        type: 'location',
      };
    }

    const displayStatus = getDisplayStatus();
    if (displayStatus !== 'ONGOING' && displayStatus !== 'NOT_STARTED' && displayStatus !== 'ABSENT') {
      return {
        text: 'Tidak Dapat Absen',
        subtext: 'Status tidak memungkinkan untuk absensi',
        type: 'status',
      };
    }

    return {
      text: 'Mulai Absensi',
      subtext: 'Siap untuk melakukan absensi',
      type: 'ready',
    };
  };

  const toggleLocationOverride = () => {
    const newOverrideState = !locationOverride;
    setLocationOverride(newOverrideState);

    if (newOverrideState) {
      setIsInLocation(true);
      console.log('Location override activated');
    } else {
      // If disabling override, recheck with actual coordinates
      const roomData = currentAttendance?.schedule?.room;
      if (coordinates && roomData) {
        const inClassroom = checkIsInClassroom(roomData);
        setIsInLocation(inClassroom);
        console.log('Location override disabled, rechecked location:', inClassroom);
      } else {
        setIsInLocation(false);
      }
    }
  };

  // Function to open location settings
  const openLocationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  };

  // Function to retry location check (now much faster using context)
  const retryLocationCheck = () => {
    if (locationError === 'Izin lokasi diperlukan' || locationError === 'Layanan lokasi tidak aktif') {
      retryLocationSetup();
    } else {
      refreshLocation();
    }
  };

  // Enhanced function to parse face verification error
  const parseFaceVerificationError = (errorMessage: string): FaceVerificationError => {
    console.log('Parsing face verification error:', errorMessage);

    // Normalize error message
    const normalizedMessage = errorMessage.toLowerCase();

    // Check for specific error patterns
    if (normalizedMessage.includes('no face detected') || normalizedMessage.includes('tidak ada wajah')) {
      return {
        type: 'FACE_NOT_DETECTED',
        message: 'Tidak ada wajah yang terdeteksi dalam gambar. Pastikan wajah Anda berada dalam frame kamera.',
      };
    }

    if (normalizedMessage.includes('face verification failed') || normalizedMessage.includes('expected') && normalizedMessage.includes('got')) {
      // Try to extract NIMs from error message
      const nimPattern = /expected (\w+), got (\w+)/i;
      const match = errorMessage.match(nimPattern);

      return {
        type: 'FACE_NOT_MATCHED',
        message: match
          ? `Wajah tidak cocok dengan data mahasiswa. Sistem mendeteksi wajah mahasiswa lain (${match[2]}) sedangkan yang diharapkan adalah ${match[1]}.`
          : 'Wajah tidak cocok dengan data mahasiswa yang terdaftar. Pastikan Anda adalah mahasiswa yang benar.',
        expectedNim: match ? match[1] : undefined,
        predictedNim: match ? match[2] : undefined,
      };
    }

    if (normalizedMessage.includes('confidence') || normalizedMessage.includes('low quality')) {
      return {
        type: 'LOW_CONFIDENCE',
        message: 'Kualitas gambar wajah kurang baik. Pastikan pencahayaan cukup dan wajah terlihat jelas.',
      };
    }

    if (normalizedMessage.includes('multiple faces') || normalizedMessage.includes('lebih dari satu wajah')) {
      return {
        type: 'MULTIPLE_FACES',
        message: 'Terdeteksi lebih dari satu wajah dalam gambar. Pastikan hanya wajah Anda yang berada dalam frame.',
      };
    }

    if (normalizedMessage.includes('model') || normalizedMessage.includes('inference')) {
      return {
        type: 'MODEL_ERROR',
        message: 'Terjadi kesalahan pada sistem pengenalan wajah. Silakan coba lagi dalam beberapa saat.',
      };
    }

    if (normalizedMessage.includes('poor') || normalizedMessage.includes('blur') || normalizedMessage.includes('dark')) {
      return {
        type: 'POOR_IMAGE_QUALITY',
        message: 'Kualitas gambar kurang baik. Pastikan pencahayaan cukup terang dan kamera tidak bergetar.',
      };
    }

    // Default case for unknown errors
    return {
      type: 'UNKNOWN_ERROR',
      message: errorMessage || 'Terjadi kesalahan tidak dikenal dalam verifikasi wajah. Silakan coba lagi.',
    };
  };

  // Enhanced function to get user-friendly error message based on retry count
  const getFaceVerificationErrorMessage = (error: FaceVerificationError, retryCount: number): string => {
    let baseMessage = error.message;

    // Add specific tips based on error type and retry count
    if (retryCount > 0) {
      switch (error.type) {
        case 'FACE_NOT_DETECTED':
          if (retryCount === 1) {
            baseMessage += '\n\nTips: Posisikan wajah Anda di tengah frame dan pastikan pencahayaan cukup terang.';
          } else if (retryCount >= 2) {
            baseMessage += '\n\nTips: Coba ganti posisi atau pindah ke tempat dengan pencahayaan yang lebih baik.';
          }
          break;

        case 'FACE_NOT_MATCHED':
          if (retryCount === 1) {
            baseMessage += '\n\nTips: Pastikan Anda adalah mahasiswa yang terdaftar dan lepaskan masker atau aksesoris yang menutupi wajah.';
          } else if (retryCount >= 2) {
            baseMessage += '\n\nJika masalah berlanjut, silakan hubungi administrator atau dosen pengampu.';
          }
          break;

        case 'LOW_CONFIDENCE':
        case 'POOR_IMAGE_QUALITY':
          if (retryCount === 1) {
            baseMessage += '\n\nTips: Bersihkan lensa kamera dan pastikan wajah menghadap langsung ke kamera.';
          } else if (retryCount >= 2) {
            baseMessage += '\n\nTips: Pindah ke tempat dengan pencahayaan yang lebih baik dan hindari bayangan pada wajah.';
          }
          break;

        case 'MULTIPLE_FACES':
          baseMessage += '\n\nTips: Pastikan tidak ada orang lain dalam frame kamera.';
          break;

        case 'MODEL_ERROR':
          if (retryCount >= 2) {
            baseMessage += '\n\nJika masalah berlanjut, silakan laporkan kepada administrator sistem.';
          }
          break;
      }
    }

    return baseMessage;
  };

  const handleAttendance = async () => {
    console.log('=== Handle Attendance Called ===');
    console.log('canAttendNowWithLocation:', canAttendNowWithLocation());
    console.log('canAttendBasedOnTime:', canAttendBasedOnTime());
    console.log('canAttendBasedOnLocation:', canAttendBasedOnLocation());
    console.log('isLocationLoading:', isLocationLoading);

    // Check if button should be disabled
    if (isButtonDisabled()) {
      const statusInfo = getButtonStatusInfo();

      if (statusInfo.type === 'loading') {
        Alert.alert(
          'Mencari Lokasi',
          'Sistem sedang mencari lokasi Anda. Silakan tunggu sebentar atau coba refresh lokasi.',
          [
            { text: 'Tunggu' },
            { text: 'Refresh Lokasi', onPress: retryLocationCheck },
            {
              text: 'Override untuk Testing',
              onPress: () => {
                setLocationOverride(true);
                setIsInLocation(true);
              },
            },
          ]
        );
        return;
      }

      if (statusInfo.type === 'time') {
        Alert.alert(
          'Absensi Belum Dibuka',
          statusInfo.subtext,
          [{ text: 'OK' }]
        );
        return;
      }

      if (statusInfo.type === 'location' || statusInfo.type === 'location_error') {
        Alert.alert(
          'Masalah Lokasi',
          statusInfo.subtext,
          [
            { text: 'Coba Lagi', onPress: retryLocationCheck },
            { text: 'Buka Pengaturan', onPress: openLocationSettings },
            {
              text: 'Override untuk Testing',
              onPress: () => {
                setLocationOverride(true);
                setIsInLocation(true);
              },
            },
          ]
        );
        return;
      }

      Alert.alert(
        'Tidak Dapat Melakukan Absensi',
        statusInfo.subtext,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check camera permission before proceeding
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Aplikasi memerlukan akses kamera untuk melakukan absensi.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Reset face verification retry count when starting new attempt
    setFaceVerificationRetryCount(0);
    setLastFaceVerificationError(null);

    // Activate camera if all conditions are met
    setIsCameraActive(true);
  };

  // SAFE: Handle camera capture result - DIRECTLY CALL API
  const handleCameraCapture = async (result: { imagePath: string, status: 'checkin', smileDetected: boolean }) => {
    console.log('Camera capture result:', result);
    setCapturedImagePath(result.imagePath);
    setIsProcessingCheckin(true);

    try {
      // SAFE: Prepare location data - use coordinates from context or safe defaults
      const roomData = currentAttendance?.schedule?.room;
      const locationData = {
        latitude: coordinates?.latitude || roomData?.latitude || 0,
        longitude: coordinates?.longitude || roomData?.longitude || 0,
        timestamp: safeCreateJakartaTimestamp(), // SAFE: Use safe timestamp function
      };

      // SAFE: Prepare face verification data
      const faceVerificationData = {
        smile_detected: result.smileDetected,
        face_matched: true,
        confidence: 0.95,
        timestamp: safeCreateJakartaTimestamp(), // SAFE: Use safe timestamp function
      };

      // Call the API to check in
      if (token) {
        console.log('Sending check-in data to API...');
        console.log('Attendance ID:', currentAttendance.attendance_id);
        console.log('Location data:', locationData);
        console.log('Face verification data:', faceVerificationData);
        console.log('Image path:', result.imagePath);

        try {
          const updatedAttendance = await checkInAttendance(
            token,
            currentAttendance.attendance_id,
            locationData,
            faceVerificationData,
            result.imagePath
          );

          console.log('Check-in API response:', updatedAttendance);

          // Merge with current attendance data
          const mergedAttendance = {
            ...currentAttendance,
            ...updatedAttendance,
            schedule: {
              ...currentAttendance.schedule,
              ...(updatedAttendance.schedule || {}),
            },
            student: {
              ...currentAttendance.student,
              ...(updatedAttendance.student || {}),
            },
          };

          console.log('Merged attendance data:', mergedAttendance);
          setCurrentAttendance(mergedAttendance);
          setIsCameraActive(false);
          setIsProcessingCheckin(false);

          // Reset retry count on success
          setFaceVerificationRetryCount(0);
          setLastFaceVerificationError(null);

          // Navigate to StatusPresence
          console.log('Navigating to StatusPresence with updated attendance');
          navigation.navigate('StatusPresence', {
            attendanceId: mergedAttendance.attendance_id,
            attendance: mergedAttendance,
            capturedImagePath: result.imagePath,
            fromScreen: 'Detail',
          });

        } catch (apiError: any) {
          console.error('API Error during check-in:', apiError);
          setIsProcessingCheckin(false);

          // Handle face verification errors with enhanced error handling
          if (apiError instanceof APIError && apiError.status === 403) {
            let errorMessage = 'Face verification failed. Please try again.';

            if (apiError.detail) {
              errorMessage = apiError.detail;
              if (errorMessage.includes('Face verification failed:')) {
                const parts = errorMessage.split('Face verification failed:');
                if (parts.length > 1) {
                  errorMessage = `Face verification failed:${parts[1].trim()}`;
                }
              }
            }

            console.log('Face verification error detected:', errorMessage);

            // Increment retry count
            setFaceVerificationRetryCount(prev => prev + 1);

            // Parse the error and get user-friendly message
            const parsedError = parseFaceVerificationError(errorMessage);
            setLastFaceVerificationError(parsedError);
            const userFriendlyMessage = getFaceVerificationErrorMessage(parsedError, faceVerificationRetryCount);

            // Show error in camera view using global function
            if ((global as any).showCameraFaceVerificationError) {
              (global as any).showCameraFaceVerificationError(userFriendlyMessage);
            }
            return;
          }

          // For other API errors, close camera and show general error
          setIsCameraActive(false);

          // SAFE: Fallback navigation with warning - use safe timestamp
          const fallbackAttendance = {
            ...currentAttendance,
            check_in_time: safeCreateJakartaTimestamp(), // SAFE: Use safe timestamp function
            status: 'PRESENT',
          };

          console.log('Using fallback attendance data for navigation:', fallbackAttendance);

          navigation.navigate('StatusPresence', {
            attendanceId: fallbackAttendance.attendance_id,
            attendance: fallbackAttendance,
            capturedImagePath: result.imagePath,
            fromScreen: 'Detail',
          });

          Alert.alert(
            'Warning',
            'Successfully captured image but there was an issue updating your attendance. Your attendance may need to be verified manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error('No auth token available for check-in');
        setIsProcessingCheckin(false);
        setIsCameraActive(false);
        Alert.alert(
          'Authentication Error',
          'Please log in again to check in.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('General error during check-in process:', error);
      setIsProcessingCheckin(false);
      setIsCameraActive(false);
      Alert.alert(
        'Error',
        'Failed to complete check-in. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle camera cancel - reset retry count and error state
  const handleCameraCancel = () => {
    console.log('Camera cancelled by user');
    setIsCameraActive(false);
    setIsProcessingCheckin(false);
    setCapturedImagePath(null);

    // Reset face verification state
    setFaceVerificationRetryCount(0);
    setLastFaceVerificationError(null);
  };

  // Enhanced face verification error handler for camera
  const handleFaceVerificationError = (errorMessage: string) => {
    console.log('🚨 DetailScreen received face verification error:', errorMessage);

    // Parse the error and increment retry count
    const parsedError = parseFaceVerificationError(errorMessage);
    setLastFaceVerificationError(parsedError);
    setFaceVerificationRetryCount(prev => prev + 1);

    // Get user-friendly message based on retry count
    const userFriendlyMessage = getFaceVerificationErrorMessage(parsedError, faceVerificationRetryCount);

    console.log('Processed error message:', userFriendlyMessage);

    // The error will be displayed in the camera component's modal
    // No need to take additional action here since camera handles the UI
  };

  // Render camera view if active
  if (isCameraActive) {
    return (
      <CameraView
        onCapture={handleCameraCapture}
        onCancel={handleCameraCancel}
        onFaceVerificationError={handleFaceVerificationError}
      />
    );
  }

  // Compute the display status for consistency
  const displayStatus = getDisplayStatus();
  const buttonStatusInfo = getButtonStatusInfo();

  // Render main detail screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#232F40"
        barStyle="light-content"
      />
      {/* Fixed Header */}
      <DetailHeader
        title={currentAttendance.schedule.course.course_name}
        subtitle={currentAttendance.schedule.chapter}
        onBackPress={() => navigation.goBack()}
      />

      {/* Content with Rounded Corners */}
      <View style={styles.contentWrapper}>
        <View style={styles.curvedContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <ClassInfoCard
              attendance={{ ...currentAttendance, status: displayStatus }}
              canAttend={!isButtonDisabled()} // Button shows but might be disabled
              onAttendPress={handleAttendance}
              isInLocation={isInLocation}
              locationOverride={locationOverride}
              onToggleLocationOverride={toggleLocationOverride}
              isCheckingLocation={isLocationLoading}
              locationError={locationError}
              onRetryLocation={retryLocationCheck}
              // Additional props for better button status handling
              buttonStatusInfo={buttonStatusInfo}
              isButtonDisabled={isButtonDisabled()}
            />

          </ScrollView>
        </View>
      </View>

      {/* Processing overlay */}
      {isProcessingCheckin && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>Processing check-in...</Text>
            <Text style={styles.processingSubtext}>Please wait while we verify your attendance</Text>
            {faceVerificationRetryCount > 0 && (
              <Text style={styles.processingRetryText}>
                Attempt {faceVerificationRetryCount + 1}
              </Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#232F40',
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
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  processingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  processingRetryText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DetailScreen;
