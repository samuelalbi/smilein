// src/context/LocationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentLocation,
  requestLocationPermission,
  checkLocationServices,
  isUserInClassroom,
} from '../utils/locationHelpers';

interface LocationContextType {
  coordinates: { latitude: number; longitude: number } | null;
  isLocationLoading: boolean;
  locationError: string | null;
  hasLocationPermission: boolean;
  locationServicesEnabled: boolean;
  lastLocationUpdate: number | null;
  // Method to check if user is in specific classroom
  checkIsInClassroom: (room: any) => boolean;
  // Method to force refresh location
  refreshLocation: () => void;
  // Method to retry location setup
  retryLocationSetup: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState<boolean>(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number | null>(null);

  // Initialize location services
  const initializeLocation = async () => {
    try {
      setIsLocationLoading(true);
      setLocationError(null);

      // Check location services first
      const servicesEnabled = await checkLocationServices();
      setLocationServicesEnabled(servicesEnabled);

      if (!servicesEnabled) {
        setLocationError('Layanan lokasi tidak aktif');
        setIsLocationLoading(false);
        return;
      }

      // Request permission
      const permissionGranted = await requestLocationPermission();
      setHasLocationPermission(permissionGranted);

      if (!permissionGranted) {
        setLocationError('Izin lokasi diperlukan');
        setIsLocationLoading(false);
        return;
      }

      // Get current location
      getCurrentLocation((position, errorMsg) => {
        setIsLocationLoading(false);
        if (position) {
          setCoordinates(position);
          setLocationError(null);
          setLastLocationUpdate(Date.now());
          console.log('Location updated in context:', position);
        } else {
          setLocationError(errorMsg || 'Tidak dapat mendeteksi lokasi');
        }
      });

    } catch (error) {
      setIsLocationLoading(false);
      setLocationError('Error saat mengakses lokasi');
      console.error('Location initialization error:', error);
    }
  };

  // Force refresh location
  const refreshLocation = () => {
    if (hasLocationPermission && locationServicesEnabled) {
      setIsLocationLoading(true);
      getCurrentLocation((position, errorMsg) => {
        setIsLocationLoading(false);
        if (position) {
          setCoordinates(position);
          setLocationError(null);
          setLastLocationUpdate(Date.now());
        } else {
          setLocationError(errorMsg || 'Tidak dapat mendeteksi lokasi');
        }
      });
    } else {
      initializeLocation();
    }
  };

  // Retry location setup (for permission/services issues)
  const retryLocationSetup = () => {
    initializeLocation();
  };

  // Check if user is in specific classroom using current coordinates
  const checkIsInClassroom = (room: any): boolean => {
    if (!coordinates || !room) {
      console.warn('Cannot check classroom location: missing coordinates or room data');
      return false;
    }

    return isUserInClassroom(coordinates.latitude, coordinates.longitude, room);
  };

  // Initialize location on mount
  useEffect(() => {
    initializeLocation();

    // Set up periodic refresh (every 60 seconds)
    const refreshInterval = setInterval(() => {
      if (hasLocationPermission && locationServicesEnabled && !isLocationLoading) {
        getCurrentLocation((position, errorMsg) => {
          if (position) {
            setCoordinates(position);
            setLocationError(null);
            setLastLocationUpdate(Date.now());
          } else if (errorMsg) {
            setLocationError(errorMsg);
          }
        });
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [hasLocationPermission, locationServicesEnabled]);

  const contextValue: LocationContextType = {
    coordinates,
    isLocationLoading,
    locationError,
    hasLocationPermission,
    locationServicesEnabled,
    lastLocationUpdate,
    checkIsInClassroom,
    refreshLocation,
    retryLocationSetup,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use location context
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
