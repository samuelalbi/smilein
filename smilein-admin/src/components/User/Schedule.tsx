import React, { useState, useEffect } from 'react';
import { ScheduleRead } from '../../types/schedule';
import * as scheduleApi from '../../api/scheduleApi';
import { StudentRead } from '../../types/student';

interface ScheduleProps {
    studentData: StudentRead | null;
}

const ScheduleComponent: React.FC<ScheduleProps> = ({ studentData }) => {
    const studentId = studentData?.student_id;

    const [schedules, setSchedules] = useState<ScheduleRead[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return; // Skip if studentId undefined/null

            try {
                setLoading(true);
                const data = await scheduleApi.getSchedules(0, 100, { instructor_id: studentId });
                setSchedules(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch schedules:', err);
                setError('Failed to load schedules');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Function to get the day name from a date string
    const getDayName = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long' });
    };

    return (
        <div className="mt-6 p-4 md:p-6 border dark:border-gray-700 rounded-lg dark:bg-gray-800">
            <h2 className="text-lg font-semibold dark:text-white mb-6">Informasi Jadwal</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Kuliah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ruangan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hari</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bab/Materi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {schedules.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada jadwal ditemukan untuk mahasiswa ini
                                    </td>
                                </tr>
                            ) : (
                                schedules.map((schedule) => (
                                    <tr key={schedule.schedule_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{schedule.schedule_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{schedule.course?.course_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{schedule.room?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {getDayName(schedule.schedule_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {formatDate(schedule.schedule_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {schedule.start_time} - {schedule.end_time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {schedule.chapter || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ScheduleComponent;