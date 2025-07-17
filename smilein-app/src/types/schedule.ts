export type AttendanceStatus = 'NOT_STARTED' | 'ONGOING' | 'PRESENT' | 'LATE' | 'ABSENT';

export type ScheduleItem = {
    id: string;
    title: string;
    subtitle: string;
    room: string;
    lecturer: string;
    time: string;
    status?: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
};
