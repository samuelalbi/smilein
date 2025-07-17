import React, { useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../utils/constants';

interface ProfileImageProps {
    imageUrl: string | null;
    isApproved: boolean;
    onImagePress: () => void;
    isLoading?: boolean;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
    imageUrl,
    isApproved,
    onImagePress,
    isLoading = false,
}) => {
    const getFullImageUrl = (url: string | null) => {
        if (!url) { return 'https://via.placeholder.com/150'; }

        if (url.startsWith('http')) { return url; }

        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        console.log('Profile image URL:', imageUrl);
        console.log('Full image URL:', getFullImageUrl(imageUrl));
    }, [imageUrl]);

    return (
        <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                    {isLoading ? (
                        <View style={[styles.profileImage, styles.loadingContainer]}>
                            <ActivityIndicator size="large" color="#3498db" />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: getFullImageUrl(imageUrl) }}
                            style={styles.profileImage}
                            defaultSource={require('../../assets/Caffe_Latte.jpg')}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.editImageButton}
                        onPress={onImagePress}
                        disabled={isLoading}
                    >
                        <Icon name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
                {isApproved && (
                    <View style={styles.verificationBadgeContainer}>
                        <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.verificationBadgeText}>Terverifikasi</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // styles remain the same as in your original code
    profileSection: {
        backgroundColor: '#1E2A40',
        paddingBottom: 30,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e1e4e8',
    },
    editImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3498db',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    verificationBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    verificationBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default ProfileImage;
