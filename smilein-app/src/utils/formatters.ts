/**
 * Format ISO date string ke format yang lebih user-friendly
 * @param dateString - ISO date string (e.g. "2023-04-15T12:30:45Z")
 * @returns Formatted date string (e.g. "15 April 2023, 12:30")
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) {return '-';}

    try {
      const date = new Date(dateString);

      // Format bulan dalam Bahasa Indonesia
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      // Format waktu
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Format nomor tahun akademik (e.g. "2023/2024")
   * @param year - Year string in format "YYYY/YYYY"
   * @returns Formatted academic year string
   */
  export const formatAcademicYear = (year: string): string => {
    if (!year || !year.includes('/')) {return year;}

    const [startYear, endYear] = year.split('/');
    return `${startYear}/${endYear}`;
  };
