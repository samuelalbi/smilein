// src/types/instructorCourse.ts

export interface InstructorCourseBase {
    instructor_id: number;
    course_id: number;
  }
  
  export interface InstructorCourseCreate extends InstructorCourseBase {
    // Any additional fields needed for creation
  }
  
  export interface InstructorCourseRead extends InstructorCourseBase {
    instructor_course_id: number;
    instructor_id: number;
    course_id: number;
    course: {
      course_id: number;
      course_name: string;
      sks: number;
      created_at: string;
    } | null; // Mark as possibly null since API might return null
    instructor: any;
    created_at: string;
    assigned_date: string;
    // We'll remove course_name from here as it should come from the course object
  }
  
  export interface InstructorCourseUpdate {
    instructor_id?: number;
    course_id?: number;
    // Any other fields that can be updated
  }
  
  // Extended with additional course information
  export interface InstructorCourseWithDetails extends InstructorCourseRead {
    description?: string;
    // Any other course details you might want to include
  }
  