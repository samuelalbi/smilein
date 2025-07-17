export interface UserInfo {
    nim: string;
    username: string;
    full_name: string;
    major_name: string;
    profile_picture_url: string | null;
    face_data: object | null;
    year: string; // Format: "YYYY/YYYY"
    is_approved: boolean;
    student_id: number;
    created_at: string;
    updated_at: string;
  }

  export interface StudentUpdateRequest {
    nim?: string | null;
    full_name?: string | null;
    major_name?: string | null;
    profile_picture_url?: string | null;
    face_data?: object | null;
    year: string;  // Required field berdasarkan schema
    is_approved?: boolean | null;
    password?: string | null;
  }

  export interface StudentResponse {
    student_id: number;
    nim: string;
    full_name: string | null;
  }
