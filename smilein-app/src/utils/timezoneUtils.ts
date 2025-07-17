// utils/timezoneUtils.ts - Safe version dengan fallback handling
export const JAKARTA_TIMEZONE = 'Asia/Jakarta';

/**
 * Safe date creation untuk menghindari invalid date
 * @param dateInput - Input date dalam berbagai format
 * @returns Valid Date object atau null jika invalid
 */
const createSafeDate = (dateInput: string | number | Date): Date | null => {
  try {
    let dateObj: Date;

    if (typeof dateInput === 'string') {
      // Handle ISO string
      if (dateInput.includes('T')) {
        // Jika sudah ada 'Z' di akhir, berarti sudah UTC
        if (dateInput.endsWith('Z')) {
          dateObj = new Date(dateInput);
        }
        // Jika tidak ada 'Z', asumsikan UTC juga (dari server)
        else {
          // Pastikan ada Z untuk marking sebagai UTC
          const withZ = dateInput.includes('.') ? dateInput + 'Z' : dateInput + '.000Z';
          dateObj = new Date(withZ);
        }
      }
      // Handle timestamp string
      else if (!isNaN(Number(dateInput))) {
        dateObj = new Date(Number(dateInput));
      }
      // Handle simple time format (12:34) - return null, biarkan as-is
      else if (dateInput.includes(':') && !dateInput.includes('T')) {
        return null; // Indicate this should be returned as-is
      }
      // Fallback: coba parse as-is
      else {
        dateObj = new Date(dateInput);
      }
    } else if (typeof dateInput === 'number') {
      dateObj = new Date(dateInput);
    } else {
      dateObj = dateInput;
    }

    // Validasi apakah date object valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date created from:', dateInput);
      return null;
    }

    return dateObj;
  } catch (error) {
    console.error('Error creating date from:', dateInput, error);
    return null;
  }
};

/**
 * Safe locale string conversion dengan fallback
 * @param date - Date object
 * @param options - Locale options
 * @returns Formatted string atau fallback
 */
const safeToLocaleString = (date: Date, options: Intl.DateTimeFormatOptions): string => {
  try {
    return date.toLocaleString('id-ID', options);
  } catch (error) {
    console.warn('Locale string conversion failed, using fallback:', error);

    // Fallback manual formatting
    try {
      const jakartaDate = new Date(date.toLocaleString('en-US', { timeZone: JAKARTA_TIMEZONE }));

      if (options.hour && options.minute) {
        const hours = jakartaDate.getHours().toString().padStart(2, '0');
        const minutes = jakartaDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      if (options.year && options.month && options.day) {
        const year = jakartaDate.getFullYear();
        const month = (jakartaDate.getMonth() + 1).toString().padStart(2, '0');
        const day = jakartaDate.getDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
      }

      return jakartaDate.toString();
    } catch (fallbackError) {
      console.error('Even fallback formatting failed:', fallbackError);
      return date.toString();
    }
  }
};

/**
 * Konversi timestamp/ISO string ke waktu Jakarta dengan safe handling
 * @param timeString - ISO string, timestamp, atau string waktu
 * @param format - Format output ('time' untuk HH:MM, 'datetime' untuk full, 'date' untuk tanggal saja)
 * @returns String waktu yang sudah dikonversi ke Jakarta timezone
 */
export const convertToJakartaTime = (
  timeString: string | null | undefined,
  format: 'time' | 'datetime' | 'date' = 'time'
): string => {
  if (!timeString) {return '-';}

  try {
    // Coba buat date object yang safe
    const dateObj = createSafeDate(timeString);

    // Jika createSafeDate return null, berarti simple time format
    if (dateObj === null) {
      console.log('Simple time format detected, returning as-is:', timeString);
      return timeString;
    }

    // Konversi ke waktu Jakarta sesuai format yang diminta
    switch (format) {
      case 'time':
        return safeToLocaleString(dateObj, {
          timeZone: JAKARTA_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

      case 'datetime':
        return safeToLocaleString(dateObj, {
          timeZone: JAKARTA_TIMEZONE,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

      case 'date':
        return safeToLocaleString(dateObj, {
          timeZone: JAKARTA_TIMEZONE,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });

      default:
        return safeToLocaleString(dateObj, {
          timeZone: JAKARTA_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
    }
  } catch (error) {
    console.error('Error converting time to Jakarta timezone:', error, 'Input:', timeString);
    // Return original string jika semua gagal
    return timeString || '-';
  }
};

/**
 * Get current Jakarta time as ISO string dengan safe handling
 * @returns ISO string in Jakarta timezone
 */
export const getCurrentJakartaTimeISO = (): string => {
  try {
    const now = new Date();

    // Method 1: Coba menggunakan toLocaleString
    try {
      const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: JAKARTA_TIMEZONE }));
      return jakartaTime.toISOString();
    } catch (localeError) {
      console.warn('Locale method failed, using offset method:', localeError);

      // Method 2: Manual offset calculation (UTC+7)
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const jakartaTime = new Date(utcTime + (7 * 3600000)); // Add 7 hours for UTC+7
      return jakartaTime.toISOString();
    }
  } catch (error) {
    console.error('All Jakarta time methods failed, using UTC:', error);
    // Fallback ke UTC timestamp
    return new Date().toISOString();
  }
};

/**
 * Get current Jakarta time in HH:MM format dengan safe handling
 * @returns String waktu Jakarta dalam format HH:MM
 */
export const getCurrentJakartaTime = (): string => {
  try {
    return convertToJakartaTime(getCurrentJakartaTimeISO(), 'time');
  } catch (error) {
    console.error('Error getting current Jakarta time:', error);
    // Fallback ke local time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
};

/**
 * Format waktu untuk display dengan handling timezone yang proper dan safe
 * Khusus untuk check-in time di attendance
 * @param timeString - ISO string atau string waktu dari server
 * @returns String waktu dalam format HH:MM (Jakarta timezone)
 */
export const formatCheckInTime = (timeString: string | null | undefined): string => {
  if (!timeString) {return '-';}

  try {
    const jakartaTime = convertToJakartaTime(timeString, 'time');

    // Log untuk debugging hanya jika jakartaTime berbeda dari input
    if (jakartaTime !== timeString && jakartaTime !== '-') {
      console.log(`🕐 Check-in time conversion: ${timeString} -> ${jakartaTime} (Jakarta)`);
    }

    return jakartaTime;
  } catch (error) {
    console.error('Error formatting check-in time:', error, 'Input:', timeString);
    return timeString || '-';
  }
};

/**
 * Buat timestamp untuk location data dengan Jakarta timezone dan safe handling
 * @returns ISO string timestamp dalam Jakarta timezone
 */
export const createJakartaTimestamp = (): string => {
  try {
    const timestamp = getCurrentJakartaTimeISO();
    console.log(`📅 Created Jakarta timestamp: ${timestamp}`);
    return timestamp;
  } catch (error) {
    console.error('Error creating Jakarta timestamp:', error);
    // Fallback ke UTC jika gagal
    const fallback = new Date().toISOString();
    console.log(`📅 Using fallback timestamp: ${fallback}`);
    return fallback;
  }
};

/**
 * Validasi apakah string waktu valid
 * @param timeString - String waktu yang akan divalidasi
 * @returns Boolean indicating validity
 */
export const isValidTimeString = (timeString: string | null | undefined): boolean => {
  if (!timeString) {return false;}

  try {
    const dateObj = createSafeDate(timeString);
    return dateObj !== null && !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};

/**
 * Debug function untuk melihat konversi waktu dengan safe handling
 * @param timeString - String waktu yang akan di-debug
 */
export const debugTimeConversion = (timeString: string) => {
  console.log('=== TIME CONVERSION DEBUG ===');
  console.log('Input:', timeString);

  try {
    console.log('Is Valid:', isValidTimeString(timeString));
    console.log('As UTC Date:', new Date(timeString));
    console.log('Jakarta Time:', convertToJakartaTime(timeString, 'time'));
    console.log('Jakarta DateTime:', convertToJakartaTime(timeString, 'datetime'));
    console.log('Current Jakarta Time:', getCurrentJakartaTime());
  } catch (error) {
    console.log('Debug Error:', error);
  }

  console.log('==============================');
};
