// src/api/instructorCourseApi.ts
import apiClient from './client';
import { InstructorCourseCreate, InstructorCourseRead, InstructorCourseUpdate } from '../types/instructorCourse'  ;

// Create a new instructor course assignment
export const createInstructorCourse = async (instructorCourse: InstructorCourseCreate): Promise<InstructorCourseRead> => {
  const response = await apiClient.post('/instructor-courses/', instructorCourse);
  return response.data;
};

// Get all instructor course assignments with pagination
export const getInstructorCourses = async (skip = 0, limit = 100): Promise<InstructorCourseRead[]> => {
  const response = await apiClient.get('/instructor-courses/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get instructor courses by instructor ID
export const getInstructorCoursesByInstructorId = async (instructorId: number): Promise<InstructorCourseRead[]> => {
  const allCourses = await getInstructorCourses();
  // Filter courses by instructor ID
  return allCourses.filter(course => course.instructor_id === instructorId);
};

// Get a specific instructor course by ID
export const getInstructorCourse = async (instructorCourseId: number): Promise<InstructorCourseRead> => {
  const response = await apiClient.get(`/instructor-courses/${instructorCourseId}`);
  return response.data;
};

// Update an existing instructor course assignment
export const updateInstructorCourse = async (instructorCourseId: number, instructorCourseData: InstructorCourseUpdate): Promise<InstructorCourseRead> => {
  try {
    const response = await apiClient.patch(`/instructor-courses/${instructorCourseId}`, instructorCourseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete an instructor course assignment by ID
export const deleteInstructorCourse = async (instructorCourseId: number): Promise<void> => {
  await apiClient.delete(`/instructor-courses/${instructorCourseId}`);
};

