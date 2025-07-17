/**
 * Formats the current date as: "Hari, DD Bulan YYYY" in Indonesian
 */
export const getCurrentFormattedDate = (): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const date = new Date();
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}, ${dateNum} ${month} ${year}`;
};

/**
 * Checks if a class can be attended at the current time
 * @param scheduledTime Class start time in format "HH:MM"
 * @returns boolean indicating if the class can be attended now
 */
export const checkIfCanAttend = (scheduledTime: string): boolean => {
    // Get current time
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Parse scheduled time (format: "13:45")
    const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number);

    // Convert both times to minutes for easier comparison
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;

    // Class end time (assuming 90 minutes duration)
    const classEndTimeInMinutes = scheduledTotalMinutes + 90;

    // Can attend 15 minutes before scheduled time and until class ends
    return currentTotalMinutes >= (scheduledTotalMinutes - 15) &&
           currentTotalMinutes <= classEndTimeInMinutes;
};

/**
 * Updates schedule statuses based on current time
 * @param scheduleItems The array of schedule items to update
 * @returns Updated array with automatic status changes
 */
export const updateClassStatuses = (scheduleItems: any[]) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes

    return scheduleItems.map(item => {
        // Parse class time
        const [hours, minutes] = item.time.split(':').map(Number);
        const classTimeInMinutes = hours * 60 + minutes;

        // Class end time (assuming 90 minutes duration)
        const classEndTimeInMinutes = classTimeInMinutes + 90;

        // Only update if not already manually set by check-in/check-out
        if (item.checkInTime || item.checkOutTime) {
            return item; // Status already set by check-in or check-out
        }

        // Logic for automatic status updates
        if (currentTime >= classTimeInMinutes && currentTime < classEndTimeInMinutes) {
            // Class is ongoing
            return { ...item, status: 'ongoing' };
        } else if (currentTime >= classEndTimeInMinutes) {
            // Class has ended and student didn't check in
            return { ...item, status: 'absent' };
        } else if (currentTime >= classTimeInMinutes - 15) {
            // Within 15 minutes before class starts
            return { ...item, status: 'ongoing' };
        } else {
            // Class hasn't started yet
            return { ...item, status: 'not_started' };
        }
    });
};
