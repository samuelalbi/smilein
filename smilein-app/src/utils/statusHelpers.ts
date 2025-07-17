// src/utils/statusHelpers.ts - FIXED VERSION
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_STARTED' | 'ONGOING' | 'READY_TO_CHECKIN';

export const getStatusColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'ONGOING':
      return '#FF9800'; // Orange
    case 'PRESENT':
      return '#4CAF50'; // Green
    case 'LATE':
      return '#FFC107'; // Yellow
    case 'ABSENT':
      return '#F44336'; // Red
    case 'READY_TO_CHECKIN':
      return '#2196F3'; // Blue
    case 'NOT_STARTED':
    default:
      return '#9E9E9E'; // Grey
  }
};

export const getStatusText = (status: AttendanceStatus): string => {
  switch (status) {
    case 'ONGOING':
      return 'Sedang Berlangsung';
    case 'PRESENT':
      return 'Hadir';
    case 'LATE':
      return 'Terlambat';
    case 'ABSENT':
      return 'Tidak Hadir';
    case 'READY_TO_CHECKIN':
      return 'Siap Check-in';
    case 'NOT_STARTED':
    default:
      return 'Belum Dimulai';
  }
};

export const getActionButtonColor = (status: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT':
    case 'LATE':
      return '#4CAF50'; // Green for already checked in
    case 'ONGOING':
      return '#FF9800'; // Orange for ongoing class
    case 'READY_TO_CHECKIN':
      return '#2196F3'; // Blue for ready to check in
    case 'NOT_STARTED':
    default:
      return '#9E9E9E'; // Grey for not available yet
  }
};

export const getActionIcon = (status: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT':
    case 'LATE':
      return 'checkmark-circle-outline'; // Already checked in
    case 'ONGOING':
      return 'camera-outline'; // Camera for attendance
    case 'READY_TO_CHECKIN':
      return 'log-in-outline'; // Check in icon
    case 'NOT_STARTED':
    default:
      return 'time-outline'; // Time icon for waiting
  }
};

export const getActionText = (status: AttendanceStatus): string => {
  switch (status) {
    case 'PRESENT':
    case 'LATE':
      return 'Sudah Absen';
    case 'ONGOING':
      return 'Absen Sekarang';
    case 'READY_TO_CHECKIN':
      return 'Masuk untuk Check-in';
    case 'NOT_STARTED':
    default:
      return 'Belum Bisa Absen';
  }
};

export const formatDate = (): string => {
  const date = new Date();
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ✅ FIXED: Simplified function to determine if can attend now (only needs start time)
export const canAttendNow = (scheduledTime: string): boolean => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Parse scheduled start time
  const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number);

  // Convert to minutes for easier comparison
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;

  // Can attend from 15 minutes before scheduled time
  const canAttendStartTime = scheduledTotalMinutes - 15;

  return currentTotalMinutes >= canAttendStartTime;
};

// ✅ NEW: Separate function for checking with end time constraint
export const canAttendNowWithEndTime = (scheduledTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Parse scheduled start time
  const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number);

  // Parse end time
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Convert to minutes for easier comparison
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Can attend from 15 minutes before scheduled time until end of class
  const canAttendStartTime = scheduledTotalMinutes - 15;

  return currentTotalMinutes >= canAttendStartTime && currentTotalMinutes <= endTotalMinutes;
};

// ✅ FIXED: Enhanced function to determine current attendance status - TIME-BASED LOGIC TAKES PRECEDENCE
export const getCurrentAttendanceStatus = (
  apiStatus: string,
  startTime: string,
  endTime: string,
  checkInTime?: string | null
): AttendanceStatus => {
  console.log(`getCurrentAttendanceStatus called with: API Status: ${apiStatus}, Start: ${startTime}, End: ${endTime}, CheckIn: ${checkInTime}`);

  // If user has actually checked in (has check_in_time), return the API status
  if (checkInTime && (apiStatus === 'PRESENT' || apiStatus === 'LATE')) {
    console.log(`User has checked in at ${checkInTime}, returning API status: ${apiStatus}`);
    return apiStatus as AttendanceStatus;
  }

  // For display purposes, use time-based logic regardless of API status
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // Parse times - handle both HH:MM and HH:MM:SS formats
  const parseTime = (timeString: string) => {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return { hours, minutes, totalMinutes: hours * 60 + minutes };
  };

  const startTimeParsed = parseTime(startTime);
  const endTimeParsed = parseTime(endTime);

  const startTotalMinutes = startTimeParsed.totalMinutes;
  const endTotalMinutes = endTimeParsed.totalMinutes;
  const canAttendStartTime = startTotalMinutes - 15; // 15 minutes before

  console.log(`Time comparison: Current: ${currentTotalMinutes}, CanAttend: ${canAttendStartTime}, Start: ${startTotalMinutes}, End: ${endTotalMinutes}`);

  // Determine status based on current time (regardless of API status for display)
  if (currentTotalMinutes < canAttendStartTime) {
    // Too early to check in
    console.log('Status: NOT_STARTED (too early)');
    return 'NOT_STARTED';
  } else if (currentTotalMinutes >= canAttendStartTime && currentTotalMinutes < startTotalMinutes) {
    // Can check in early (15 minutes before)
    console.log('Status: READY_TO_CHECKIN (early checkin period)');
    return 'READY_TO_CHECKIN';
  } else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) {
    // Class is ongoing
    console.log('Status: ONGOING (class in progress)');
    return 'ONGOING';
  } else {
    // Class has ended
    // Only mark as ABSENT if user hasn't checked in AND class has ended
    if (!checkInTime) {
      console.log('Status: ABSENT (class ended, no check-in)');
      return 'ABSENT';
    } else {
      // If user has checked in but class ended, return API status
      console.log(`Class ended but user checked in, returning API status: ${apiStatus}`);
      return apiStatus as AttendanceStatus;
    }
  }
};

// ✅ ENHANCED: Function to check if attendance action is allowed
export const canTakeAttendanceAction = (status: AttendanceStatus): boolean => {
  const canTake = status === 'READY_TO_CHECKIN' || status === 'ONGOING';
  console.log(`canTakeAttendanceAction: ${status} -> ${canTake}`);
  return canTake;
};

// ✅ NEW: Helper function to check if a time is within attendance window
export const isWithinAttendanceWindow = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeString: string) => {
    const parts = timeString.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const startTotalMinutes = parseTime(startTime);
  const endTotalMinutes = parseTime(endTime);
  const attendanceStartTime = startTotalMinutes - 15; // 15 minutes before

  return currentTotalMinutes >= attendanceStartTime && currentTotalMinutes <= endTotalMinutes;
};

// ✅ NEW: Helper function to get time until next action is available
export const getTimeUntilNextAction = (startTime: string): number => {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (timeString: string) => {
    const parts = timeString.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const startTotalMinutes = parseTime(startTime);
  const attendanceStartTime = startTotalMinutes - 15; // 15 minutes before

  return Math.max(0, attendanceStartTime - currentTotalMinutes);
};

// ✅ NEW: Helper function to format time difference in readable format
export const formatTimeDifference = (minutes: number): string => {
  if (minutes === 0) {return 'Sekarang';}

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} jam ${remainingMinutes} menit`;
  }

  return `${remainingMinutes} menit`;
};