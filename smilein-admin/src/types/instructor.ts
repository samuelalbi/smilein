// src/types/instructor.ts
export interface InstructorCreate {
    nidn: string;
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
    profile_picture_url?: string | null;
    password: string;
    is_active?: boolean;
  }
  
  export interface InstructorRead {
    instructor_id: number;
    nidn: string;
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface InstructorUpdate {
    nidn?: string | null;
    full_name?: string | null;
    username?:string|null;
    email?: string | null;
    phone_number?: string | null;
    profile_picture_url?: string | null;
    password?: string | null;
  }