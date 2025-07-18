export interface Dataset {
    dataset_id: number;
    student_id: number;
    image_url: string;
    label: string;
    created_at: string;
}

export interface DatasetCreate {
    student_id: number;
    image_url: string;
    label: string;
}

export interface DatasetUpdate {
    image_url?: string;
    label?: string;
}