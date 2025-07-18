  export interface StudentCreate {
    username: string;
    full_name: string;
    major_name: string;
    nim: string; // Added NIM field
    profile_picture_url?: string | null;
    face_data?: Record<string, any> | null;
    year: string; // Pattern: "YYYY/YYYY"
    is_approved?: boolean;
    password: string;
  }
  
  export interface StudentRead {
    student_id: number;
    username: string;
    nim: string; // Added NIM field
    full_name: string;
    major_name: string;
    profile_picture_url: string | null;
    face_data: Record<string, any> | null;
    year: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface StudentUpdate {
    username?: string | null;
    full_name?: string | null;
    major_name?: string | null;
    nim?: string | null; // Added NIM field
    profile_picture_url?: string | null;
    face_data?: Record<string, any> | null;
    year?: string | null;
    is_approved?: boolean | null;
    password?: string | null;
  }