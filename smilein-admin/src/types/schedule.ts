// src/types/schedule.ts
export interface ScheduleCreate {
  course_id: number;
  instructor_id: number;
  room_id: number;
  chapter?: string;
  start_time: string;
  end_time: string;
  // day_of_week field removed
  schedule_date: string;
}

export interface ScheduleRead {
  schedule_id: number;
  room: {
    room_id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  chapter?: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
  created_at: string;
  course: {
    course_id: number;
    course_name: string;
  };
  instructor: {
    instructor_id: number;
    full_name: string;
  };
}

export interface ScheduleUpdate {
  course_id?: number;
  instructor_id?: number;
  room_id?: number;
  chapter?: string;
  start_time?: string;
  end_time?: string;
  // day_of_week field removed
  schedule_date?: string;
}

export interface HTTPValidationError {
  detail?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}