// src/api/studentApi.ts

import apiClient from './client';
import { StudentCreate, StudentRead, StudentUpdate } from '../types/student';

// Create a new student
export const createStudent = async (student: StudentCreate): Promise<StudentRead> => {
  const response = await apiClient.post<StudentRead>('/students/', student);
  return response.data;
};

// Get all students with pagination
export const getStudents = async (skip = 0, limit = 100): Promise<StudentRead[]> => {
  const response = await apiClient.get<StudentRead[]>('/students/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get a specific student by ID
export const getStudent = async (studentId: number): Promise<StudentRead> => {
  const response = await apiClient.get<StudentRead>(`/students/${studentId}`);
  return response.data;
};

// Update a student
export const updateStudent = async (studentId: number, studentData: StudentUpdate): Promise<StudentRead> => {
  try {
    const currentStudent = await getStudent(studentId);
    console.log(currentStudent)

    const mergedData = { ...currentStudent, ...studentData };

    const response = await apiClient.put<StudentRead>(`/students/${studentId}`, mergedData);

    console.log(response.data)
    return response.data;
    
  } catch (error) {
    throw error;
  }
  
};



// Delete a student
export const deleteStudent = async (studentId: number): Promise<void> => {
  await apiClient.delete(`/students/${studentId}`);
};

// Update student's face data
export const updateFaceData = async (studentId: number, faceData: Record<string, any>): Promise<StudentRead> => {
  const response = await apiClient.post<StudentRead>(`/students/${studentId}/face`, faceData);
  return response.data;
};

// Upload student profile picture
export const uploadProfilePicture = async (studentId: number, file: File): Promise<StudentRead> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<StudentRead>(`/students/${studentId}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getNextStudent = async (studentId: number): Promise<StudentRead> => {
  try {
    const response = await apiClient.get(`/students/${studentId}/next`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch next student', error);
    throw error;
  }
};

export const getStudentProfilePicture = async (studentId: number): Promise<{profile_picture_url: string | null}> => {
  try {
    const response = await apiClient.get(`/students/${studentId}/profile-picture`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile picture', error);
    throw error;
  }
};