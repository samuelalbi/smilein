// src/hooks/useClassStatus.ts
import { useState, useEffect } from 'react';
import { ScheduleItem } from '../types/schedule';

/**
 * Custom hook to manage class status updates based on current time
 * @param initialSchedule The initial schedule data
 * @returns Object containing the current schedule and setter function
 */
export const useClassStatus = (initialSchedule: ScheduleItem) => {
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem>(initialSchedule);

  useEffect(() => {
    // Function to check and update class status based on current time
    const checkClassStatus = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHours * 60 + currentMinutes;

      // Parse scheduled time
      const [scheduledHours, scheduledMinutes] = initialSchedule.time.split(':').map(Number);
      const scheduledTime = scheduledHours * 60 + scheduledMinutes;

      // Update the status if needed (only changes not_started to ongoing)
      if (currentTime >= scheduledTime && currentSchedule.status === 'not_started') {
        setCurrentSchedule(prev => ({
          ...prev,
          status: 'ongoing',
        }));
      }
    };

    // Check immediately and then every minute
    checkClassStatus();
    const interval = setInterval(checkClassStatus, 60000);

    return () => clearInterval(interval);
  }, [initialSchedule.time, currentSchedule.status, initialSchedule]);

  return { currentSchedule, setCurrentSchedule };
};
