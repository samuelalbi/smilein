// src/utils/statusPresenceUtils.ts
import { AttendanceStatus } from '../types/schedule';

/**
 * Gets the color for a given attendance status
 */
export const getStatusColor = (status?: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT':
      return '#4CAF50';
    case 'LATE':
      return '#FFC107';
    case 'ABSENT':
      return '#F44336';
    case 'ONGOING':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

/**
 * Gets the display text for a given attendance status
 */
export const getStatusText = (status?: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT':
      return 'Hadir';
    case 'LATE':
      return 'Terlambat';
    case 'ABSENT':
      return 'Tidak Hadir';
    case 'ONGOING':
      return 'Sedang Berlangsung';
    default:
      return 'Belum Dimulai';
  }
};

/**
 * Gets the description text for a given attendance status
 */
export const getStatusDescription = (status: AttendanceStatus, checkOutTime: string | null): string => {
  switch (status) {
    case 'PRESENT':
      return checkOutTime
        ? 'Anda telah melakukan absensi tepat waktu dan checkout.'
        : 'Anda telah melakukan absensi tepat waktu.';
    case 'LATE':
      return checkOutTime
        ? 'Anda telah melakukan absensi terlambat dan checkout.'
        : 'Anda telah melakukan absensi namun terlambat.';
    case 'ABSENT':
      return 'Anda tidak melakukan absensi pada mata kuliah ini.';
    case 'ONGOING':
      return 'Mata kuliah sedang berlangsung.';
    default:
      return 'Mata kuliah belum dimulai.';
  }
};

/**
 * Gets the appropriate icon name for the status
 */
export const getStatusIcon = (status: AttendanceStatus, checkOutTime: string | null): string => {
  if (status === 'PRESENT' && checkOutTime) {
    return 'checkmark-done-circle'; // Double checkmark for complete attendance
  } else if (status === 'PRESENT') {
    return 'checkmark-circle'; // Single checkmark for PRESENT without checkout
  } else if (status === 'LATE' && checkOutTime) {
    return 'time'; // Time icon for LATE but completed
  } else if (status === 'LATE') {
    return 'alert-circle'; // Alert for LATE without checkout
  } else if (status === 'ABSENT') {
    return 'close-circle'; // X for ABSENT
  } else {
    return 'hourglass'; // Hourglass for any other state
  }
};

/**
 * Checks if a class is still ONGOING based on its start time
 */
export const isClassStillONGOING = (classTime?: string): boolean => {
  if (!classTime) { return true; } // Default to true if no time provided

  // Get current time
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Parse class time
  const [hours, minutes] = classTime.split(':').map(Number);

  // Convert both to minutes for easier comparison
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const classTotalMinutes = hours * 60 + minutes;

  // Assume class is 90 minutes
  const classEndTime = classTotalMinutes + 90;

  // Class is still ONGOING if current time is before end time
  return currentTotalMinutes <= classEndTime;
};
