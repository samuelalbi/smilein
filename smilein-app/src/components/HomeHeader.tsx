// HomeHeader.tsx (Optimized for better performance)
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLocation } from '../context/LocationContext';
import { BASE_URL } from '../utils/constants';

// Default avatar URL for fallback
const DEFAULT_AVATAR_URL = 'https://randomuser.me/api/portraits/men/32.jpg';

// Implement getCurrentFormattedDate directly in component
const getCurrentFormattedDate = (): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const date = new Date();
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}, ${dateNum} ${month} ${year}`;
};

type HomeHeaderProps = {
    onProfilePress: () => void;
    onLogoutPress: () => void;
    userName: string;
    avatarUrl: string;
    isApproved?: boolean;
};

const HomeHeader: React.FC<HomeHeaderProps> = ({
    onProfilePress,
    onLogoutPress,
    userName,
    avatarUrl,
    isApproved = false,
}) => {
    const [imageError, setImageError] = useState(false);

    // Use location context
    const {
        coordinates,
        isLocationLoading,
        locationError,
        refreshLocation,
        retryLocationSetup,
        lastLocationUpdate,
    } = useLocation();

    // Memoize the profile image URL to avoid recalculation on every render
    const profileImageUrl = useMemo(() => {
        // If we had an error loading the image or no URL provided, use default
        if (imageError || !avatarUrl || avatarUrl.trim() === '') {
            return DEFAULT_AVATAR_URL;
        }

        // If URL starts with http, it's already a full URL
        if (avatarUrl.startsWith('http')) {
            return avatarUrl;
        }

        // Otherwise, prepend the base URL
        return `${BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    }, [avatarUrl, imageError]);

    // Reset image error state when avatarUrl changes
    useEffect(() => {
        if (avatarUrl !== '') {
            setImageError(false);
        }
    }, [avatarUrl]);

    // Memoize location display to avoid recalculation
    const locationDisplay = useMemo(() => {
        if (isLocationLoading) {
            return 'Mengambil lokasi...';
        }

        if (locationError) {
            return locationError;
        }

        if (coordinates) {
            return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
        }

        return 'Lokasi tidak tersedia';
    }, [isLocationLoading, locationError, coordinates]);

    const handleRetryLocation = () => {
        if (locationError === 'Izin lokasi diperlukan' || locationError === 'Layanan lokasi tidak aktif') {
            retryLocationSetup();
        } else {
            refreshLocation();
        }
    };

    const handleImageError = () => {
        console.log('Profile image loading error, falling back to default avatar');
        setImageError(true);
    };

    const handleImageLoad = () => {
        console.log('Profile image loaded successfully');
    };

    return (
        <View style={styles.container}>
            {/* User Profile Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={onProfilePress}
                >
                    <View style={styles.profileImageWrapper}>
                        <Image
                            source={{ uri: profileImageUrl }}
                            style={styles.avatar}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            resizeMode="cover"
                        />

                        {/* Verification badge if approved */}
                        {isApproved && (
                            <View style={styles.verificationBadge}>
                                <Icon name="checkmark" size={10} color="#4CAF50" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.userName} numberOfLines={2} ellipsizeMode="tail">
                        {userName}
                    </Text>
                </TouchableOpacity>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onLogoutPress}
                    >
                        <Icon name="exit-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Schedule Info Section */}
            <View style={styles.scheduleInfoContainer}>
                {/* Location Banner */}
                <TouchableOpacity
                    style={[
                        styles.locationBanner,
                        locationError ? styles.locationError : null,
                    ]}
                    onPress={locationError ? handleRetryLocation : undefined}
                >
                    <Icon
                        name={locationError ? 'alert-circle-outline' : 'location-outline'}
                        size={18}
                        color="#fff"
                        style={styles.locationIcon}
                    />
                    <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                        Lokasi Saat Ini : {locationDisplay}
                    </Text>
                    {locationError && (
                        <Icon name="refresh-outline" size={18} color="#fff" style={styles.retryIcon} />
                    )}
                    {/* Show last update time if available */}
                    {lastLocationUpdate && !locationError && (
                        <Text style={styles.lastUpdateText}>
                            {new Date(lastLocationUpdate).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Schedule Title */}
                <View style={styles.scheduleTitleContainer}>
                    <Text style={styles.scheduleHeading}>Jadwal Hari Ini</Text>
                    <Text style={styles.dateText}>{getCurrentFormattedDate()}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#232F40',
    },
    header: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    profileImageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(255,255,255,0.1)', // Fallback background
    },
    verificationBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 5,
    },
    scheduleInfoContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    locationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 30,
        alignSelf: 'flex-end',
    },
    locationError: {
        backgroundColor: 'rgba(255,100,100,0.3)',
    },
    locationIcon: {
        marginRight: 5,
    },
    retryIcon: {
        marginLeft: 5,
    },
    locationText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        flex: 1,
    },
    lastUpdateText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 5,
    },
    scheduleTitleContainer: {
        marginBottom: 5,
    },
    scheduleHeading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.3,
    },
    dateText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
});

export default HomeHeader;
