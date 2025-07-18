// src/api/courseApi.ts

import apiClient from './client';
import { Course, CourseCreate, CourseUpdate } from '../types/course';

// Create a new course
export const createCourse = async (course: CourseCreate): Promise<Course> => {
  const response = await apiClient.post<Course>('/courses/', course);
  return response.data;
};

// Get all courses with pagination
export const getCourses = async (skip = 0, limit = 100): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/courses/', {
    params: { skip, limit }
  });
  return response.data;
};

// Get a specific course by ID
export const getCourse = async (courseId: number): Promise<Course> => {
  const response = await apiClient.get<Course>(`/courses/${courseId}`);
  return response.data;
};

// Update a course
export const updateCourse = async (courseId: number, courseData: CourseUpdate): Promise<Course> => {
  const response = await apiClient.put<Course>(`/courses/${courseId}`, courseData);
  return response.data;
};

// Delete a course
export const deleteCourse = async (courseId: number): Promise<Course> => {
  const response = await apiClient.delete<Course>(`/courses/${courseId}`);
  return response.data;
};

// Get course statistics (if you have a specialized endpoint)
export const getCourseStatistics = async (courseId: number): Promise<Course> => {
  // This could be a separate endpoint if your API has one
  // For now, we're just getting the course details which should include statistics
  const response = await apiClient.get<Course>(`/courses/${courseId}/statistics`);
  return response.data;
};

// Add instructor to course (based on your API documentation)
export const addInstructorToCourse = async (courseId: number, instructorId: number): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/instructors/${instructorId}`);
};

// Remove instructor from course
export const removeInstructorFromCourse = async (courseId: number, instructorId: number): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/instructors/${instructorId}`);
};