import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchUserProfile,
  fetchUserProfilePicture,
  updateUserProfile,
  ProfileResponse,
  uploadProfilePicture,
} from '../services/apiProfile';

export type UserInfo = ProfileResponse;

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nim: '',
    username: '',
    full_name: '',
    major_name: '',
    profile_picture_url: '',
    face_data: {},
    year: '',
    is_approved: false,
    student_id: 0,
    created_at: '',
    updated_at: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch user data');

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token retrieved:', token ? 'Token exists' : 'No token found');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch complete user profile data
      console.log('Calling fetchUserProfile API...');
      const userData = await fetchUserProfile(token);
      console.log('User data received:', userData);

      // Update state with fetched data
      setUserInfo(userData);
      setError(null);
      return true;
    } catch (err: any) {
      console.error('Error in fetchUserData:', err);
      // More detailed error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
        console.error('Response error headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
      } else {
        // Something happened in setting up the request
        console.error('Error message:', err.message);
      }

      setError(err.message || 'Failed to fetch user data');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfilePicture = useCallback(async () => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch only profile picture
      const pictureData = await fetchUserProfilePicture(token);

      // Update just the profile picture URL in state
      setUserInfo(prevState => ({
        ...prevState,
        profile_picture_url: pictureData.profile_picture_url,
      }));

      return pictureData.profile_picture_url;
    } catch (err: any) {
      console.error('Error fetching profile picture:', err);
      // Don't update error state here to avoid disrupting the main view
      return null;
    }
  }, []);

  const updateUserField = useCallback((key: keyof UserInfo, value: string) => {
    console.log(`Updating field: ${key} with value: ${value}`);
    setUserInfo(prevState => ({
      ...prevState,
      [key]: value,
    }));
  }, []);

  const saveUserChanges = useCallback(async () => {
    try {
      console.log('Starting to save user changes');

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token for update:', token ? 'Token exists' : 'No token found');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Prepare data for update (including all required fields)
      const updateData = {
        nim: userInfo.nim,
        full_name: userInfo.full_name,
        major_name: userInfo.major_name,
        year: userInfo.year, // Add the year field
        username: userInfo.username, // Include username as it might be editable
      };

      console.log('Sending update with data:', updateData);

      // Update user profile
      const updatedData = await updateUserProfile(token, updateData);
      console.log('Update successful, received:', updatedData);

      // Update state with returned data
      setUserInfo(updatedData);
      setError(null);
      return true;
    } catch (err: any) {
      console.error('Error in saveUserChanges:', err);
      // More detailed error logging
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }

      setError(err.message || 'Failed to save changes');
      return false;
    }
  }, [userInfo]);

  const uploadProfileImage = useCallback(async (imageUri: string) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Upload the profile picture
      const result = await uploadProfilePicture(token, imageUri);

      // Update just the profile picture URL in state
      setUserInfo(prevState => ({
        ...prevState,
        profile_picture_url: result.profile_picture_url,
      }));

      return result.profile_picture_url;
    } catch (err: any) {
      console.error('Error uploading profile image:', err);
      throw err;
    }
  }, []);

  return {
    userInfo,
    setUserInfo,
    loading,
    error,
    fetchUserData,
    fetchProfilePicture,
    updateUserField,
    saveUserChanges,
    uploadProfileImage,
  };
};
