// src/types/admin.ts
export interface AdminCreate {
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
    profile_picture_url?: string | null;
    password: string;
    is_active?: boolean;
  }
  
  export interface AdminRead {
    admin_id: number;
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    password:string;
  }
  
  export interface AdminUpdate {
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
    phone_number?: string | null;
    profile_picture_url?: string | null;
    password?: string | null;
    is_active?: boolean | null;
  }