export interface Course {
    course_id: number;
    course_name: string;
    sks: number;
    created_at: string;
}

export interface CourseCreate {
    course_name: string;
    sks: number;
}

export interface CourseUpdate {
    course_name: string;
    sks: number;
}
