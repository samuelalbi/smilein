import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BASE_URL } from '../utils/constants';

interface TokenPayload {
  user_id: number;
}

// Interface for profile response
export interface ProfileResponse {
  nim: string;
  username: string;
  full_name: string;
  major_name: string;
  profile_picture_url: string;
  face_data: Record<string, unknown>;
  year: string;
  is_approved: boolean;
  student_id: number;
  created_at: string;
  updated_at: string;
}

// Get the student ID from the JWT token
export const getStudentIdFromToken = (token: string): number => {
  try {
    const decoded = jwtDecode(token) as TokenPayload;
    return decoded.user_id;
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Invalid token');
  }
};

// Get the complete profile picture URL
export const getFullProfilePictureUrl = (relativePath: string): string => {
  if (!relativePath) {
    return 'https://via.placeholder.com/150';
  }

  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }

  // Otherwise, prepend the base URL
  return `${BASE_URL}${relativePath}`;
};

// Get user profile data (student information)
export const fetchUserProfile = async (token: string): Promise<ProfileResponse> => {
  try {
    const studentId = getStudentIdFromToken(token);
    const response = await axios.get<ProfileResponse>(
      `${BASE_URL}/students/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user profile picture only - FIXED VERSION
export const fetchUserProfilePicture = async (token: string): Promise<{ profile_picture_url: string }> => {
  try {
    const studentId = getStudentIdFromToken(token);
    const response = await axios.get<{ profile_picture_url: string }>(
      `${BASE_URL}/students/${studentId}/profile-picture`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Add timeout to prevent hanging
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error: any) {
    // Check if it's a 404 (user doesn't have profile picture yet)
    if (error.response && error.response.status === 404) {
      console.log('User does not have a profile picture yet');
      return { profile_picture_url: '' }; // Return empty string instead of throwing
    }

    // Check if it's a network timeout or connection error
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('Profile picture fetch timeout, using fallback');
      return { profile_picture_url: '' }; // Return empty string for timeout
    }

    console.error('Error fetching profile picture:', error);

    // For other errors, return empty string instead of throwing
    // This ensures the app doesn't crash when profile picture can't be loaded
    return { profile_picture_url: '' };
  }
};

// Update user profile data
export const updateUserProfile = async (
  token: string,
  updatedData: Partial<ProfileResponse>
): Promise<ProfileResponse> => {
  try {
    const studentId = getStudentIdFromToken(token);
    const response = await axios.put<ProfileResponse>(
      `${BASE_URL}/students/${studentId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (
  token: string,
  imageUri: string
): Promise<{ profile_picture_url: string }> => {
  try {
    // Extract student ID from token
    const studentId = getStudentIdFromToken(token);
    console.log('Uploading image for student ID:', studentId);

    // Create form data
    const formData = new FormData();

    // Get file name from URI
    const fileName = imageUri.split('/').pop() || 'profile-picture.jpg';
    const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // IMPORTANT: The server is expecting a field named 'file' not 'image'
    formData.append('file', {
      uri: imageUri,
      type: fileType,
      name: fileName,
    } as any);

    // Log the form data for debugging
    console.log('Form data:', JSON.stringify(formData));

    const response = await axios.post<{ profile_picture_url: string }>(
      `${BASE_URL}/students/${studentId}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    console.log('Upload successful, response status:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);

    if (error.response) {
      console.error('Response error data:', JSON.stringify(error.response.data));
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', JSON.stringify(error.response.headers));
    }

    throw error;
  }
};
