// src/api/attendanceApi.ts

import apiClient from './client';
import { 
  AttendanceRead, 
  AttendanceUpdate, 
  AttendanceWithScheduleRead,
} from '../types/attendance';


// Get all attendances with pagination
export const getAttendances = async (skip = 0, limit = 100): Promise<AttendanceWithScheduleRead[]> => {
  const response = await apiClient.get<AttendanceWithScheduleRead[]>('/attendances/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get a specific attendance record by ID
export const getAttendance = async (attendanceId: number): Promise<AttendanceRead> => {
  const response = await apiClient.get<AttendanceRead>(`/attendances/${attendanceId}`);
  return response.data;
};

// Update an attendance record
export const updateAttendance = async (attendanceId: number, data: AttendanceUpdate): Promise<AttendanceRead> => {
  const response = await apiClient.patch<AttendanceRead>(`/attendances/${attendanceId}`, data);
  return response.data;
};

// Delete an attendance record
export const deleteAttendance = async (attendanceId: number): Promise<void> => {
  await apiClient.delete(`/attendances/${attendanceId}`);
};

