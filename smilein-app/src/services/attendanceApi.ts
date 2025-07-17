// src/services/attendanceApi.ts - Safe version dengan error handling yang lebih baik
import { BASE_URL } from '../utils/constants';

// Safe import dengan fallback
let timezoneUtils: any = null;
try {
  timezoneUtils = require('../utils/timezoneUtils');
  console.log('✅ timezoneUtils imported successfully');
} catch (importError) {
  console.warn('⚠️ Could not import timezoneUtils, using fallback methods:', importError);
}

export interface Student {
  nim: string;
  username: string;
  full_name: string;
  major_name: string;
  profile_picture_url?: string;
  face_data: string | null;
  year: string;
  is_approved: boolean;
}

export interface Room {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  room_id: number;
}

export interface Course {
  course_id: number;
  course_name: string;
}

export interface Instructor {
  instructor_id: number;
  full_name: string;
}

export interface Schedule {
  date: string;
  schedule_id: number;
  room: Room;
  chapter: string;
  day_of_week: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  course: Course;
  instructor: Instructor;
}

// Updated to include new status
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_STARTED' | 'ONGOING' | 'READY_TO_CHECKIN';

export interface Attendance {
  attendance_id: number;
  date: string;
  check_in_time: string | null;
  check_out_time?: string | null;
  status: AttendanceStatus;
  location_data: any | null;
  face_verification_data: any | null;
  smile_detected: boolean;
  image_captured_url?: string | null;
  created_at: string;
  updated_at: string | null;
  student: Student;
  schedule: Schedule;
}

// Custom error class for API errors
export class APIError extends Error {
  public status: number;
  public detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

// Fallback timezone functions jika import gagal
const fallbackGetJakartaDate = (): Date => {
  const now = new Date();
  try {
    // Method 1: Try dengan timezone
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return jakartaTime;
  } catch (error) {
    console.warn('Timezone method failed, using offset method:', error);
    // Method 2: Manual offset (UTC+7)
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jakartaTime = new Date(utcTime + (7 * 3600000));
    return jakartaTime;
  }
};

const fallbackCreateTimestamp = (): string => {
  try {
    return fallbackGetJakartaDate().toISOString();
  } catch (error) {
    console.error('Fallback timestamp creation failed:', error);
    return new Date().toISOString();
  }
};

const fallbackConvertTime = (timeString: string | null): string => {
  if (!timeString) {return '-';}

  try {
    if (timeString.includes('T')) {
      const dateObj = timeString.endsWith('Z') ?
        new Date(timeString) :
        new Date(timeString + 'Z');

      const jakartaTime = new Date(dateObj.getTime() + (7 * 3600000));
      const hours = jakartaTime.getHours().toString().padStart(2, '0');
      const minutes = jakartaTime.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return timeString;
  } catch (error) {
    console.error('Fallback time conversion failed:', error);
    return timeString;
  }
};

// Safe wrapper functions
const safeCreateJakartaTimestamp = (): string => {
  if (timezoneUtils && timezoneUtils.createJakartaTimestamp) {
    try {
      return timezoneUtils.createJakartaTimestamp();
    } catch (error) {
      console.warn('timezoneUtils.createJakartaTimestamp failed, using fallback:', error);
    }
  }

  return fallbackCreateTimestamp();
};

const safeConvertToJakartaTime = (timeString: string | null, format: string = 'time'): string => {
  if (timezoneUtils && timezoneUtils.convertToJakartaTime) {
    try {
      return timezoneUtils.convertToJakartaTime(timeString, format);
    } catch (error) {
      console.warn('timezoneUtils.convertToJakartaTime failed, using fallback:', error);
    }
  }

  return fallbackConvertTime(timeString);
};

// SAFE: Function to get the current date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  try {
    const jakartaDate = fallbackGetJakartaDate();

    const yyyy = jakartaDate.getFullYear();
    const mm = String(jakartaDate.getMonth() + 1).padStart(2, '0');
    const dd = String(jakartaDate.getDate()).padStart(2, '0');

    const result = `${yyyy}-${mm}-${dd}`;
    console.log(`📅 Today's date (Jakarta): ${result}`);

    return result;
  } catch (error) {
    console.error('Error getting today date:', error);
    // Fallback ke UTC date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
};

// Function to fetch attendances with optional filters
export const fetchStudentAttendances = async (
  token: string,
  studentId?: number,
  date?: string
): Promise<Attendance[]> => {
  try {
    if (!studentId) {
      console.error('Student ID is missing in fetchStudentAttendances');
      return [];
    }

    let endpoint = `/attendances/student/${studentId}`;

    if (date) {
      endpoint += `?date=${date}`;
    }

    console.log(`Making API request to: ${BASE_URL}${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response);

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching attendances:', error);
    return [];
  }
};

// Helper function to validate and prepare image file dengan safe handling
const prepareImageFile = async (imagePath: string): Promise<{
  uri: string;
  type: string;
  name: string;
  size?: number;
}> => {
  try {
    // Import React Native modules dengan safe handling
    let RNFS: any;
    try {
      RNFS = require('react-native-fs');
    } catch (rnfsError) {
      console.error('Could not import react-native-fs:', rnfsError);
      throw new Error('react-native-fs is required for image handling');
    }

    // Ensure path has file:// prefix
    const normalizedPath = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;

    // Get file stats for debugging dengan safe handling
    let fileSize = 0;
    try {
      const stats = await RNFS.stat(imagePath);
      fileSize = stats.size;
      console.log(`Image file stats: size=${fileSize} bytes, path=${imagePath}`);
    } catch (statError) {
      console.warn('Could not get file stats:', statError);
    }

    // Extract filename from path
    const pathParts = imagePath.split('/');
    const originalFilename = pathParts[pathParts.length - 1];

    // Create a new filename with timestamp for uniqueness
    const timestamp = Date.now();
    const fileExtension = originalFilename.includes('.')
      ? originalFilename.split('.').pop()
      : 'jpg';
    const filename = `attendance_${timestamp}.${fileExtension}`;

    console.log(`Prepared image file: ${filename}, size: ${fileSize} bytes`);

    return {
      uri: normalizedPath,
      type: 'image/jpeg', // Force JPEG type for consistency
      name: filename,
      size: fileSize,
    };
  } catch (error) {
    console.error('Error preparing image file:', error);
    throw new Error(`Failed to prepare image file: ${error}`);
  }
};

// Enhanced error handling function
const handleAPIError = async (response: Response): Promise<never> => {
  const status = response.status;
  console.log(`API Error - Status: ${status}`);

  let errorText = '';
  try {
    errorText = await response.text();
    console.log(`API Error - Raw response: ${errorText}`);
  } catch (textError) {
    console.error('Could not read error response text:', textError);
    errorText = 'Unknown error response';
  }

  // Try to parse as JSON
  let errorData;
  try {
    errorData = JSON.parse(errorText);
  } catch (parseError) {
    // If not JSON, use text as is
    console.warn('Could not parse error response as JSON:', parseError);
    throw new APIError(`API Error (${status}): ${errorText}`, status, errorText);
  }

  // Handle different error response formats
  let errorMessage = `API Error (${status})`;
  let detail = '';

  if (errorData.detail) {
    detail = errorData.detail;
    errorMessage = `API Error (${status}): ${detail}`;
  } else if (errorData.message) {
    detail = errorData.message;
    errorMessage = `API Error (${status}): ${detail}`;
  } else if (typeof errorData === 'string') {
    detail = errorData;
    errorMessage = `API Error (${status}): ${detail}`;
  } else {
    detail = JSON.stringify(errorData);
    errorMessage = `API Error (${status}): ${detail}`;
  }

  // Special handling for face verification errors (403)
  if (status === 403 && detail.includes('Face verification failed')) {
    console.log('Face verification error detected');
    throw new APIError(errorMessage, status, detail);
  }

  throw new APIError(errorMessage, status, detail);
};

// SAFE: Function to check in attendance with enhanced error handling
export const checkInAttendance = async (
  token: string,
  attendanceId: number,
  locationData: any,
  faceVerificationData: any,
  capturedImagePath: string | null
): Promise<Attendance> => {
  console.log('=== Starting CheckIn Process (Safe Version) ===');
  console.log('Attendance ID:', attendanceId);
  console.log('Location Data:', locationData);
  console.log('Face Verification Data:', faceVerificationData);
  console.log('Captured Image Path:', capturedImagePath);

  if (!capturedImagePath) {
    throw new Error('Image path is required for check-in');
  }

  // Create form data for multipart/form-data request
  let formData: FormData;
  try {
    formData = new FormData();
  } catch (formDataError) {
    console.error('Could not create FormData:', formDataError);
    throw new Error('FormData creation failed');
  }

  // SAFE: Ensure timestamps are properly formatted
  let processedLocationData: any;
  let processedFaceVerificationData: any;

  try {
    processedLocationData = {
      ...locationData,
      timestamp: locationData.timestamp || safeCreateJakartaTimestamp(),
    };

    processedFaceVerificationData = {
      ...faceVerificationData,
      timestamp: faceVerificationData.timestamp || safeCreateJakartaTimestamp(),
    };

    console.log('Processed location data:', processedLocationData);
    console.log('Processed face verification data:', processedFaceVerificationData);
  } catch (dataProcessingError) {
    console.error('Error processing data:', dataProcessingError);
    // Fallback to original data
    processedLocationData = locationData;
    processedFaceVerificationData = faceVerificationData;
  }

  // Add JSON stringified data as form fields dengan safe handling
  try {
    formData.append('location_data', JSON.stringify(processedLocationData));
    formData.append('face_verification_data', JSON.stringify(processedFaceVerificationData));
    formData.append('smile_detected', 'true');
  } catch (appendError) {
    console.error('Error appending data to FormData:', appendError);
    throw new Error('Failed to prepare form data');
  }

  // Prepare and validate image file
  let imageFile: any;
  try {
    imageFile = await prepareImageFile(capturedImagePath);
    console.log('Successfully prepared image file:', {
      uri: imageFile.uri,
      type: imageFile.type,
      name: imageFile.name,
      size: imageFile.size,
    });
  } catch (imageError) {
    console.error('Error preparing image file:', imageError);
    throw new Error(`Image preparation failed: ${imageError.message}`);
  }

  // Add the image file to FormData dengan safe handling
  try {
    formData.append('image_captured_url', imageFile as any);
  } catch (imageAppendError) {
    console.error('Error appending image to FormData:', imageAppendError);
    throw new Error('Failed to attach image to form data');
  }

  const apiUrl = `${BASE_URL}/attendances/${attendanceId}/check-in`;
  console.log(`Sending check-in request to: ${apiUrl}`);

  // Make the API request with enhanced error handling
  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: Don't set Content-Type manually for FormData
        // It will be set automatically with the boundary
      },
      body: formData,
    });

    console.log(`API Response Status: ${response.status}`);
    console.log('API Response Headers:', response.headers);
  } catch (fetchError) {
    console.error('Network error during API request:', fetchError);
    throw new Error(`Network error: ${fetchError.message}`);
  }

  // Check if request was successful
  if (!response.ok) {
    // Use enhanced error handling
    await handleAPIError(response);
  }

  // Parse and return the response data dengan safe handling
  let responseText = '';
  try {
    responseText = await response.text();
    console.log('Raw API Response:', responseText);
  } catch (responseError) {
    console.error('Error reading response text:', responseError);
    throw new Error('Failed to read server response');
  }

  try {
    const data = JSON.parse(responseText);
    console.log('Parsed Check-in Response:', data);

    // SAFE: Log timezone information for debugging
    if (data.check_in_time) {
      console.log(`🕐 Server returned check_in_time: ${data.check_in_time}`);

      try {
        const jakartaTime = safeConvertToJakartaTime(data.check_in_time, 'time');
        console.log(`🕐 Jakarta time would be: ${jakartaTime}`);
      } catch (conversionError) {
        console.warn('Could not convert server time to Jakarta time:', conversionError);
      }
    }

    return data;
  } catch (parseError) {
    console.error('Failed to parse API response:', parseError);
    console.error('Raw response was:', responseText);
    throw new Error('Invalid response format from server');
  }
};
