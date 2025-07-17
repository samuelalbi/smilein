/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, Alert, StyleSheet, SafeAreaView, ActivityIndicator, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'react-native-image-picker';

// Components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileImage from '../components/profile/ProfileImage';
import ProfileContent from '../components/profile/ProfileContent';

// Hooks & Services
import { useUserInfo } from '../hooks/useUserInfo';
import { openImagePicker } from '../services/ImagePickerService';

const ProfileSettingScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        userInfo,
        loading,
        error,
        fetchUserData,
        fetchProfilePicture,
        updateUserField,
        saveUserChanges,
        uploadProfileImage,
    } = useUserInfo();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            console.log('ProfileSettingScreen: Component mounted, fetching data');
            await fetchUserData();
            // Tambahkan pemanggilan fetchProfilePicture setelah fetchUserData berhasil
            await fetchProfilePicture();
        };
        loadData();
    }, []);

    const handleImageUpload = async (imageData: Asset): Promise<void> => {
        try {
            if (imageData.uri) {
                setIsUploadingImage(true);
                console.log('Image data to upload:', JSON.stringify(imageData));

                // Log more details about the image
                console.log('Image URI:', imageData.uri);
                console.log('Image type:', imageData.type);
                console.log('Image name:', imageData.fileName);

                // Upload image to server
                const uploadedImageUrl = await uploadProfileImage(imageData.uri);
                console.log('Upload successful, URL:', uploadedImageUrl);

                Alert.alert('Sukses', 'Foto profil berhasil diperbarui');
            } else {
                throw new Error('No image URI provided');
            }
        } catch (error: any) {
            console.error('Error in handleImageUpload:', error);

            // Provide a more specific error message to the user
            let errorMessage = 'Gagal mengunggah foto profil';
            if (error.response && error.response.data && error.response.data.msg) {
                errorMessage += ': ' + error.response.data.msg;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSaveChanges = async (): Promise<void> => {
        try {
            console.log('Saving changes for user:', userInfo.username);
            setIsSaving(true);

            // Validate fields before saving
            if (!userInfo.nim) {
                throw new Error('NIM tidak boleh kosong');
            }
            if (!userInfo.full_name) {
                throw new Error('Nama lengkap tidak boleh kosong');
            }
            if (!userInfo.major_name) {
                throw new Error('Program studi tidak boleh kosong');
            }

            const success = await saveUserChanges();

            if (success) {
                Alert.alert('Sukses', 'Perubahan berhasil disimpan', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                throw new Error('Failed to save changes');
            }
        } catch (error: any) {
            console.error('Error saving changes:', error);

            // More specific error message
            let errorMessage = 'Gagal menyimpan perubahan';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response && error.response.data) {
                if (error.response.data.detail && Array.isArray(error.response.data.detail)) {
                    // Format validation errors from API
                    const details = error.response.data.detail.map((detail: any) => {
                        const field = detail.loc[detail.loc.length - 1];
                        return `${field}: ${detail.msg}`;
                    }).join('\n');
                    errorMessage += '\n' + details;
                } else if (error.response.data.msg) {
                    errorMessage += ': ' + error.response.data.msg;
                }
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const retryFetch = () => {
        console.log('Retrying data fetch...');
        fetchUserData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar backgroundColor="#1E2A40" barStyle="light-content" />
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar backgroundColor="#1E2A40" barStyle="light-content" />
                <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Coba Lagi" onPress={retryFetch} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#1E2A40" barStyle="light-content" />

            {/* Header Component */}
            <ProfileHeader onBackPress={() => navigation.goBack()} />

            {/* Profile Image Component */}
            <ProfileImage
                imageUrl={userInfo.profile_picture_url}
                isApproved={userInfo.is_approved}
                onImagePress={() => openImagePicker(handleImageUpload)}
                isLoading={isUploadingImage}
            />

            {/* Content Component */}
            <ProfileContent
                userInfo={userInfo}
                onUpdateField={updateUserField}
                onSaveChanges={handleSaveChanges}
                isSaving={isSaving}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2A40',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E2A40',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E2A40',
        padding: 20,
    },
    errorTitle: {
        color: '#ff6b6b',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default ProfileSettingScreen;
