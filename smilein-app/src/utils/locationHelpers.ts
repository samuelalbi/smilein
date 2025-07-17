// src/utils/locationHelpers.ts
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

// Define a type for classroom locations
export type ClassroomLocation = {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
};

// Example classroom locations - replace with your actual locations
export const CLASSROOM_LOCATIONS: Record<string, ClassroomLocation> = {
  'R-101': {
    name: 'Room 101',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
  'R-102': {
    name: 'Room 102',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
  'R-103': {
    name: 'Room 103',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
  'Room 6-102': {
    name: 'Room 6-102',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
  'Room 6-205': {
    name: 'Room 6-205',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
  'Room 5-301': {
    name: 'Room 5-301',
    latitude: 2.385575,
    longitude: 99.148604,
    radius: 200,
  },
};

// Check if location services are enabled
export const checkLocationServices = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'android') {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          console.log('Location service check error:', error);
          if (error.code === 2) {
            Alert.alert(
              'Layanan Lokasi Dinonaktifkan',
              'Silakan aktifkan GPS dan layanan lokasi di pengaturan perangkat Anda.',
              [
                {
                  text: 'Buka Pengaturan',
                  onPress: () => Linking.openSettings(),
                },
                {
                  text: 'Nanti',
                  style: 'cancel',
                },
              ]
            );
            resolve(false);
          } else {
            resolve(true);
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      // For iOS, check using a quick location request
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings.',
            [
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
              {
                text: 'Later',
                style: 'cancel',
              },
            ]
          );
          resolve(false);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  });
};

// Request location permission with improved UX
export const requestLocationPermission = async (): Promise<boolean> => {
  // First check if location services are enabled
  const locationServicesEnabled = await checkLocationServices();
  if (!locationServicesEnabled) {
    return false;
  }

  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Izin Lokasi',
        message: 'Aplikasi memerlukan akses lokasi untuk verifikasi kehadiran',
        buttonNeutral: 'Tanya Nanti',
        buttonNegative: 'Batal',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in meters
};

// Check if user is within the specified classroom location
export const isUserInClassroom = (
  userLat: number,
  userLon: number,
  room: any // Using 'any' for now, but you should define a proper Room type
): boolean => {
  // Check if we have a room object with coordinates
  if (!room || !room.latitude || !room.longitude || !room.radius) {
    console.warn('Invalid room data:', room);
    return false;
  }

  const distance = calculateDistance(
    userLat,
    userLon,
    room.latitude,
    room.longitude,
  );

  console.log(`Distance to room: ${distance}m, Allowed radius: ${room.radius}m`);
  return distance <= room.radius;
};

// Get default location for a room
export const getDefaultLocation = (roomCode: string): { latitude: number, longitude: number } => {
  const classroom = CLASSROOM_LOCATIONS[roomCode];

  if (classroom) {
    return {
      latitude: classroom.latitude,
      longitude: classroom.longitude,
    };
  }

  // Default coordinates if room not found
  return {
    latitude: 2.386297,
    longitude: 99.147041,
  };
};

// Function to handle location errors with better user feedback
const handleLocationError = (error: any): string => {
  let errorMessage = 'Tidak dapat mendeteksi lokasi';

  switch (error.code) {
    case 1:
      errorMessage = 'Izin lokasi ditolak';
      break;
    case 2:
      errorMessage = 'Layanan lokasi tidak tersedia';
      break;
    case 3:
      errorMessage = 'Waktu pengambilan lokasi habis';
      break;
    case 4:
      errorMessage = 'Layanan Google Play tidak tersedia';
      break;
  }

  return errorMessage;
};

export const quickLocationCheck = (
  cachedCoordinates: { latitude: number; longitude: number } | null,
  room: any
): { isInLocation: boolean; needsRefresh: boolean } => {
  if (!cachedCoordinates || !room) {
    return { isInLocation: false, needsRefresh: true };
  }

  const isInLocation = isUserInClassroom(
    cachedCoordinates.latitude,
    cachedCoordinates.longitude,
    room
  );

  // Check if coordinates are too old (older than 5 minutes)
  const lastUpdate = Date.now() - (5 * 60 * 1000); // 5 minutes ago
  const needsRefresh = false; // LocationContext handles refresh automatically

  return { isInLocation, needsRefresh };
};

// Get current location with multiple retries and fallback options
export const getCurrentLocation = (
  callback: (position: { latitude: number, longitude: number } | null, errorMsg?: string) => void,
  retries = 2
): void => {
  let retryCount = 0;

  const attemptGetLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log(`Location attempt ${retryCount + 1} failed:`, error);

        if (retryCount < retries) {
          retryCount++;
          console.log(`Retrying location (${retryCount}/${retries})...`);

          // Use less accurate setting on retry
          const highAccuracy = retryCount < retries;
          setTimeout(() => {
            Geolocation.getCurrentPosition(
              (position) => {
                callback({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (retryError) => {
                console.log(`Retry ${retryCount} failed:`, retryError);
                if (retryCount === retries) {
                  const errorMsg = handleLocationError(retryError);
                  callback(null, errorMsg);
                } else {
                  attemptGetLocation();
                }
              },
              {
                enableHighAccuracy: highAccuracy,
                timeout: 10000,
                maximumAge: 15000,
                forceRequestLocation: true,
              }
            );
          }, 1000);
        } else {
          const errorMsg = handleLocationError(error);
          callback(null, errorMsg);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
      }
    );
  };

  attemptGetLocation();
};

// Check user location with improved error handling
export const checkUserLocation = (
  room: any, // Again, define a proper Room type
  callback: (isInLocation: boolean, errorMsg?: string) => void,
) => {
  console.log('Checking user location with room:', JSON.stringify(room));

  getCurrentLocation(
    (position, errorMsg) => {
      if (position) {
        const isInLocation = isUserInClassroom(
          position.latitude,
          position.longitude,
          room
        );
        console.log(`User at [${position.latitude}, ${position.longitude}], in location: ${isInLocation}`);
        callback(isInLocation);
      } else {
        console.log('Location error:', errorMsg);
        callback(false, errorMsg);
      }
    }
  );
};

// Watch location with better error handling
export const watchUserLocation = (
  room: any,
  callback: (isInLocation: boolean, errorMsg?: string) => void,
  onError?: (errorMsg: string) => void
): number => {
  return Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const isInLocation = isUserInClassroom(latitude, longitude, room);
      callback(isInLocation);
    },
    (error) => {
      const errorMsg = handleLocationError(error);
      callback(false, errorMsg);
      if (onError) {onError(errorMsg);}
    },
    {
      enableHighAccuracy: false,
      distanceFilter: 10,
      interval: 5000,
      fastestInterval: 2000,
      forceRequestLocation: true,
      showLocationDialog: true,
    },
  );
};

// Clear location watcher
export const clearLocationWatcher = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};
