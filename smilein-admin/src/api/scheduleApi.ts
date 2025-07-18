// src/api/scheduleApi.ts
import apiClient from './client';
import { ScheduleCreate, ScheduleRead, ScheduleUpdate } from '../types/schedule';

// Helper function for error handling
const handleApiError = (error: unknown, customMessage: string): never => {
  // Log error details for debugging
  console.error(`${customMessage}:`, error);
  
  // Check if it's an error with response property (axios error)
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      console.error('Authentication error: Please check if you are logged in');
    }
  }
  
  // Throw the error for the component to handle
  throw error;
};

// Create a new schedule
export const createSchedule = async (schedule: ScheduleCreate): Promise<ScheduleRead> => {
  try {
    console.log('Creating schedule with data:', JSON.stringify(schedule, null, 2));
    console.log('day_of_week type:', typeof schedule.day_of_week);
    console.log('day_of_week value:', schedule.day_of_week);
    
    const response = await apiClient.post<ScheduleRead>('/schedules/', schedule);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Error status:', axiosError.response?.status);
      console.error('Error data:', JSON.stringify(axiosError.response?.data, null, 2));
    }
    return handleApiError(error, 'Failed to create schedule');
  }
};

// Get all schedules with optional filters
export const getSchedules = async (
  skip = 0, 
  limit = 100, 
  filters?: {
    course_id?: number | null;
    instructor_id?: number | null;
    room_id?: number | null;
    day_of_week?: number | null;
  }
): Promise<ScheduleRead[]> => {
  try {
    console.log('Fetching schedules with params:', { skip, limit, ...filters });
    
    const response = await apiClient.get<ScheduleRead[]>('/schedules/', {
      params: { skip, limit, ...filters }
    });
    
    console.log('Successfully fetched schedules:', response.data.length);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch schedules');
  }
};

// Get a specific schedule by ID
export const getSchedule = async (scheduleId: number): Promise<ScheduleRead> => {
  try {
    const response = await apiClient.get<ScheduleRead>(`/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to fetch schedule with ID ${scheduleId}`);
  }
};

// Update a schedule
export const updateSchedule = async (
  scheduleId: number, 
  scheduleData: ScheduleUpdate
): Promise<ScheduleRead> => {
  try {
    const response = await apiClient.patch<ScheduleRead>(`/schedules/${scheduleId}`, scheduleData);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to update schedule with ID ${scheduleId}`);
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  try {
    console.log(`Attempting to delete schedule with ID: ${scheduleId}`);
    
    // Set a longer timeout to avoid race conditions
    await apiClient.delete(`/schedules/${scheduleId}`, {
      timeout: 10000 
    });
    
    console.log(`Successfully deleted schedule with ID: ${scheduleId}`);
  } catch (error: unknown) {
    console.error(`Error deleting schedule with ID ${scheduleId}:`, error);
    
    // Log error details for debugging
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Error status:', axiosError.response?.status);
      console.error('Error data:', JSON.stringify(axiosError.response?.data, null, 2));
    }
    
    // Re-throw for component handling
    handleApiError(error, `Failed to delete schedule with ID ${scheduleId}`);
  }
};

// The following methods need to be updated if they're still needed and part of the API

// Get schedules for a specific student
export const getStudentSchedules = async (
  studentId: number, 
  skip = 0, 
  limit = 100
): Promise<ScheduleRead[]> => {
  try {
    const response = await apiClient.get<ScheduleRead[]>(`/schedules/student/${studentId}/schedules`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to fetch schedules for student with ID ${studentId}`);
  }
};

// Create a schedule for a specific student (admin only)
export const createStudentSchedule = async (
  studentId: number, 
  schedule: ScheduleCreate
): Promise<ScheduleRead> => {
  try {
    const response = await apiClient.post<ScheduleRead>(`/schedules/student/${studentId}/schedules`, schedule);
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to create schedule for student with ID ${studentId}`);
  }
};

// Update a student's schedule (admin only)
export const updateStudentSchedule = async (
  studentId: number, 
  scheduleId: number, 
  scheduleData: ScheduleUpdate
): Promise<ScheduleRead> => {
  try {
    const response = await apiClient.patch<ScheduleRead>(
      `/schedules/student/${studentId}/schedules/${scheduleId}`, 
      scheduleData
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, `Failed to update schedule ${scheduleId} for student ${studentId}`);
  }
};

// Delete a student's schedule (admin only)
export const deleteStudentSchedule = async (
  studentId: number, 
  scheduleId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/schedules/student/${studentId}/schedules/${scheduleId}`);
  } catch (error) {
    handleApiError(error, `Failed to delete schedule ${scheduleId} for student ${studentId}`);
  }
};