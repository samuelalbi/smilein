import React, { useRef } from 'react';
import Modal from '../../components/Modal';
import { AttendanceWithScheduleRead, AttendanceUpdate } from '../../types/attendance';
import Swal from 'sweetalert2';

interface UpdateAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAttendance: AttendanceWithScheduleRead | null;
    onUpdateAttendance: (attendanceId: number, attendanceData: AttendanceUpdate) => Promise<void>;
}

const ATTENDANCE_STATUS = ['PRESENT', 'LATE', 'ABSENT'];

const UpdateAttendanceModal: React.FC<UpdateAttendanceModalProps> = ({
    isOpen,
    onClose,
    currentAttendance,
    onUpdateAttendance
}) => {
    const statusRef = useRef<HTMLSelectElement>(null);
    const checkInTimeRef = useRef<HTMLInputElement>(null);

    const showAlert = (title: string, message: string, icon: 'success' | 'error' | 'warning'): void => {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            customClass: {
                container: 'font-sans'
            }
        });
    };

    const handleSubmit = async (): Promise<void> => {
        if (!currentAttendance) {
            showAlert('Error', 'Tidak ada data kehadiran yang dipilih', 'error');
            return;
        }

        const status = statusRef.current?.value;
        const checkInTime = checkInTimeRef.current?.value;

        const updateData: AttendanceUpdate = {};

        if (status && status !== currentAttendance.status) {
            updateData.status = status;
        }
        
        if (checkInTime && checkInTime !== currentAttendance.check_in_time) {
            updateData.check_in_time = checkInTime;
        }

        if (Object.keys(updateData).length === 0) {
            showAlert('Info', 'Tidak ada perubahan yang dilakukan', 'warning');
            return;
        }

        try {
            await onUpdateAttendance(currentAttendance.attendance_id, updateData);
            onClose();
        } catch (err) {
            console.error('Failed to update attendance:', err);
            showAlert('Error!', 'Gagal memperbarui data kehadiran', 'error');
        }
    };

    // Get status display text
    const getStatusText = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'PRESENT': return 'Hadir';
            case 'LATE': return 'Terlambat';
            case 'ABSENT': return 'Tidak Hadir';
            default: return status;
        }
    };

    if (!currentAttendance) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Perbarui Kehadiran"
            onConfirm={handleSubmit}
        >
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nama Mahasiswa
                    </label>
                    <input
                        type="text"
                        value={currentAttendance.student?.full_name || '-'}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Mata Kuliah
                    </label>
                    <input
                        type="text"
                        value={currentAttendance.schedule?.course?.course_name || '-'}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Tanggal
                    </label>
                    <input
                        type="text"
                        value={currentAttendance.date}
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Status
                    </label>
                    <select
                        ref={statusRef}
                        defaultValue={currentAttendance.status}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                    >
                        {ATTENDANCE_STATUS.map((status) => (
                            <option key={status} value={status}>
                                {getStatusText(status)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Waktu Check-in
                    </label>
                    <input
                        ref={checkInTimeRef}
                        type="time"
                        defaultValue={currentAttendance.check_in_time || ''}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default UpdateAttendanceModal;