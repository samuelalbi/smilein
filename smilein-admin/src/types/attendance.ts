export interface AttendanceCreate {
  location_data?: Record<string, any> | string | null;
  face_verification_data?: Record<string, any> | string | null;
  smile_detected?: boolean | null;
  image_captured_url?: string | null;
}

export interface AttendanceRead {
  attendance_id: number;
  student_id: number;
  schedule_id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  location_data: Record<string, any> | null;
  face_verification_data: Record<string, any> | null;
  smile_detected: boolean;
  image_captured_url: string | null;
  created_at: string;
  updated_at: string | null;
  student: {
    nim: string;
    username: string;
    full_name: string;
    major_name: string;
    profile_picture_url: string;
    face_data: Record<string, any>;
    year: string;
    is_approved: boolean;
  };
  schedule: {
    schedule_date: string;
    schedule_id: number;
    room: {
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
      room_id: number;
    };
    chapter: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    course: {
      course_id: number;
      course_name: string;
    };
    instructor: {
      instructor_id: number;
      full_name: string;
    };
  };
}

export interface AttendanceUpdate {
  check_out_time?: string | null;
  status?: string | null;
  updated_at?: string | null;
  location_data?: Record<string, any> | null;
  face_verification_data?: Record<string, any> | null;
  image_captured_url?: string | null;
}

export interface AttendanceWithScheduleRead extends AttendanceRead {
  student_name?: string | null;
  course_name?: string | null;
  schedule_day?: string | null;
  schedule_time?: string | null;
}

export interface CheckInRequest {
  location_data: Record<string, any>;
  face_verification_data: Record<string, any>;
  image_captured_url?: string | null;
}