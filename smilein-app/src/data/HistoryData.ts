import { AttendanceStatus } from '../components/ScheduleCard';

export interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  room: string;
  lecturer: string;
  time: string;
  date: string;
  status: AttendanceStatus;
  checkInTime: string;
  checkOutTime: string;
}

export const historySampleData: HistoryItem[] = [
  {
    id: '1',
    title: 'Pemrograman Mobile',
    subtitle: 'Teknik Informatika',
    room: 'Lab Komputer 2',
    lecturer: 'Dr. Ahmad Fauzi',
    time: '08:00 - 10:30',
    date: '2025-04-01',
    status: 'present' as AttendanceStatus,
    checkInTime: '07:55',
    checkOutTime: '10:25',
  },
  {
    id: '2',
    title: 'Basis Data Lanjut',
    subtitle: 'Teknik Informatika',
    room: 'Ruang 301',
    lecturer: 'Prof. Budi Santoso',
    time: '13:00 - 15:30',
    date: '2025-04-01',
    status: 'late' as AttendanceStatus,
    checkInTime: '13:20',
    checkOutTime: '15:35',
  },
  {
    id: '3',
    title: 'Kecerdasan Buatan',
    subtitle: 'Teknik Informatika',
    room: 'Lab AI',
    lecturer: 'Dr. Chandra Wijaya',
    time: '09:30 - 12:00',
    date: '2025-04-02',
    status: 'present' as AttendanceStatus,
    checkInTime: '09:25',
    checkOutTime: '12:00',
  },
  {
    id: '4',
    title: 'Jaringan Komputer',
    subtitle: 'Teknik Informatika',
    room: 'Lab Jaringan',
    lecturer: 'Dr. Dewi Anggraini',
    time: '15:00 - 17:30',
    date: '2025-04-03',
    status: 'absent' as AttendanceStatus,
    checkInTime: '',
    checkOutTime: '',
  },
];
