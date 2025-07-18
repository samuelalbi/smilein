// src/api/adminApi.ts
import apiClient from './client';
import { AdminCreate, AdminRead, AdminUpdate } from '../types/admin';

interface ProfilePictureResponse {
  profile_picture_url: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Create a new admin
export const createAdmin = async (admin: AdminCreate): Promise<AdminRead> => {
  const response = await apiClient.post('/admins/', admin);
  return response.data;
};

// Get all admins with pagination
export const getAdmins = async (skip = 0, limit = 100): Promise<AdminRead[]> => {
  const response = await apiClient.get('/admins/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get a specific admin by ID
export const getAdmin = async (adminId: number): Promise<AdminRead> => {
  const response = await apiClient.get(`/admins/${adminId}`);
  return response.data;
};

export const getAdminByUsername = async(username: string): Promise<AdminRead> => {
  const response = await apiClient.get(`/admins/instructors/${username}`);
  return response.data;
};

// Update an admin
export const updateAdmin = async (adminId: number, adminData: AdminUpdate): Promise<AdminRead> => {
  try {
    const currentAdmin = await getAdmin(adminId);
    console.log(currentAdmin);

    const mergedData = { ...currentAdmin, ...adminData };

    const response = await apiClient.patch(`/admins/${adminId}`, mergedData);

    console.log(response.data);
    return response.data;
    
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData: ChangePasswordRequest): Promise<any> => {
  try {
    const response = await apiClient.post('/admins/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Delete an admin
export const deleteAdmin = async (adminId: number): Promise<void> => {
  await apiClient.delete(`/admins/${adminId}`);
};

// Optional: admin profile picture (similar to student API)
export const uploadProfilePicture = async (adminId: number, file: File): Promise<ProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post(`/admins/${adminId}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getAdminProfilePicture = async (adminId: number): Promise<ProfilePictureResponse> => {
  try {
    const response = await apiClient.get(`/admins/${adminId}/profile-picture`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile picture', error);
    throw error;
  }
};