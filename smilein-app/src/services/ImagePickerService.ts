import { launchImageLibrary, Asset } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadProfilePicture } from './apiProfile';

// Open image picker to select an image
export const openImagePicker = async (
  onImageSelected: (image: Asset) => void
): Promise<void> => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    includeBase64: false,
    quality: 0.8,
  });

  if (result.didCancel) {
    console.log('User cancelled image picker');
  } else if (result.errorCode) {
    console.error('Image picker error: ', result.errorMessage);
  } else if (result.assets && result.assets.length > 0) {
    const selectedImage = result.assets[0];
    onImageSelected(selectedImage);
  }
};

// Handle the upload of profile image
export const handleProfileImageUpload = async (
  imageUri: string
): Promise<string> => {
  try {
    console.log('Uploading image from URI:', imageUri);

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Use the API function to upload the profile picture
    const result = await uploadProfilePicture(token, imageUri);

    return result.profile_picture_url;
  } catch (error) {
    console.error('Error during image upload:', error);
    throw error;
  }
};
