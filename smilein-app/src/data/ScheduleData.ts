// src/data/ScheduleData.ts
import { ScheduleItem } from '../types/schedule';

export const initialScheduleData: ScheduleItem[] = [
  {
    id: '1',
    title: 'Pengenalan Basis Data',
    subtitle: 'Bagian 1: Pengenalan SQL',
    room: 'Room 6-205',
    lecturer: 'Pak Rudy Chandra',
    time: '09:00',
    status: 'ongoing',
  },
  {
    id: '2',
    title: 'Algoritma dan Pemrograman',
    subtitle: 'Bagian 2: Perulangan dan Array',
    room: 'Room 5-301',
    lecturer: 'Bu Lina Wijaya',
    time: '11:00',
    status: 'not_started',
  },
  {
    id: '3',
    title: 'Pemrograman Web',
    subtitle: 'Bagian 3: CSS dan JavaScript',
    room: 'Room 6-102',
    lecturer: 'Pak Budi Santoso',
    time: '15:30',
    status: 'not_started',
  },
  {
    id: '4',
    title: 'Jaringan Komputer',
    subtitle: 'Bagian 1: Konsep Dasar TCP/IP',
    room: 'R-101',
    lecturer: 'Pak Dharma Putra',
    time: '21:45',
    status: 'not_started',
  },
];
