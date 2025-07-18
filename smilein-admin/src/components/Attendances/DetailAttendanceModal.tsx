import React from 'react';
import Modal from '../../components/Modal';
import { AttendanceWithScheduleRead } from '../../types/attendance';
import { format, parseISO } from 'date-fns';

interface AttendanceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: AttendanceWithScheduleRead;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
    isOpen,
    onClose,
    attendance
}) => {
    // Convert UTC time to WIB (UTC+7)
    const convertToWIB = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        try {
            const utcDate = new Date(dateString);
            // Add 7 hours for WIB timezone
            const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
            return wibDate;
        } catch (error) {
            return null;
        }
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Format time with WIB timezone conversion
    const formatTimeWIB = (timeString: string | null) => {
        if (!timeString) return '-';
        try {
            const wibDate = convertToWIB(timeString);
            if (!wibDate) return timeString;
            return format(wibDate, 'dd/MM/yyyy HH:mm:ss') + ' WIB';
        } catch (error) {
            return timeString;
        }
    };

    // Format datetime with WIB timezone conversion
    const formatDateTimeWIB = (dateTimeString: string | null) => {
        if (!dateTimeString) return '-';
        try {
            const wibDate = convertToWIB(dateTimeString);
            if (!wibDate) return dateTimeString;
            return format(wibDate, 'dd/MM/yyyy HH:mm:ss') + ' WIB';
        } catch (error) {
            return dateTimeString;
        }
    };

    // Format time with proper datetime formatting (for non-WIB times)
    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        try {
            // Parse ISO timestamp and format it as dd/MM/yyyy HH:mm:ss
            return format(parseISO(timeString), 'dd/MM/yyyy HH:mm:ss');
        } catch (error) {
            return timeString;
        }
    };

    // Format datetime (for non-WIB times)
    const formatDateTime = (dateTimeString: string | null) => {
        if (!dateTimeString) return '-';
        try {
            return format(new Date(dateTimeString), 'dd/MM/yyyy HH:mm:ss');
        } catch (error) {
            return dateTimeString;
        }
    };

    // Get status display
    const getStatusDisplay = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PRESENT':
                return {
                    text: 'Hadir',
                    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                };
            case 'LATE':
                return {
                    text: 'Terlambat',
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                };
            case 'ABSENT':
                return {
                    text: 'Tidak Hadir',
                    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                };
            default:
                return {
                    text: status,
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
                };
        }
    };

    // Helper function to extract face verification data
    const getFaceVerificationDetails = (faceData: Record<string, any> | null) => {
        if (!faceData || typeof faceData !== 'object') {
            return {
                verified: '-',
                confidence: '-',
                predictedName: '-',
                timestamp: '-'
            };
        }

        return {
            verified: faceData.verified !== undefined ? (faceData.verified ? 'Ya' : 'Tidak') : '-',
            confidence: faceData.confidence ? `${(faceData.confidence * 100).toFixed(2)}%` : '-',
            predictedName: faceData.predicted_name || '-',
            timestamp: faceData.timestamp ? formatDateTime(faceData.timestamp) : '-'
        };
    };

    // Helper function to extract location data
    const getLocationDetails = (locationData: Record<string, any> | null) => {
        if (!locationData || typeof locationData !== 'object') {
            return {
                latitude: '-',
                longitude: '-',
                timestamp: '-'
            };
        }

        return {
            latitude: locationData.latitude ? locationData.latitude.toFixed(8) : '-',
            longitude: locationData.longitude ? locationData.longitude.toFixed(7) : '-',
            timestamp: locationData.timestamp ? formatDateTime(locationData.timestamp) : '-'
        };
    };

    const status = getStatusDisplay(attendance.status);
    const faceDetails = getFaceVerificationDetails(attendance.face_verification_data);
    const locationDetails = getLocationDetails(attendance.location_data);

    // Generate full image URL with backend URL
    const getFullImageUrl = (imagePath: string | null): string => {
        if (!imagePath) return ''; // Return empty string instead of null

        // If the path already starts with http:// or https://, return it as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Extract filename from the path
        const filename = imagePath.split('/').pop();

        // Backend URL - change this to your environment variable if available
        const BACKEND_URL = 'https://web-production-b963.up.railway.app';

        // Return the complete path to the attendance images folder with backend URL
        return `${BACKEND_URL}/uploads/attendance_images/${filename}`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Kehadiran"
            showConfirmButton={false}
            size="lg"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Informasi Mahasiswa</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">NIM</p>
                            <p className="font-medium dark:text-gray-100">{attendance.student?.nim || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
                            <p className="font-medium dark:text-gray-100">{attendance.student?.full_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Program Studi</p>
                            <p className="font-medium dark:text-gray-100">{attendance.student?.major_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Masuk</p>
                            <p className="font-medium dark:text-gray-100">{attendance.student?.year || '-'}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Informasi Mata Kuliah</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mata Kuliah</p>
                            <p className="font-medium dark:text-gray-100">{attendance.schedule?.course?.course_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pengajar</p>
                            <p className="font-medium dark:text-gray-100">{attendance.schedule?.instructor?.full_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ruangan</p>
                            <p className="font-medium dark:text-gray-100">{attendance.schedule?.room?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Jadwal</p>
                            <p className="font-medium dark:text-gray-100">
                                {attendance.schedule?.start_time} - {attendance.schedule?.end_time}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Informasi Kehadiran</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID Kehadiran</p>
                            <p className="font-medium dark:text-gray-100">{attendance.attendance_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
                            <p className="font-medium dark:text-gray-100">{formatDate(attendance.date)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check-in</p>
                            <p className="font-medium dark:text-gray-100">{formatTimeWIB(attendance.check_in_time) || 'Tidak Check-in'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className="font-medium">
                                <span className={`px-2 py-1 rounded-full text-sm ${status.className}`}>
                                    {status.text}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Dibuat pada</p>
                            <p className="font-medium dark:text-gray-100">{formatDateTimeWIB(attendance.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Diperbarui pada</p>
                            <p className="font-medium dark:text-gray-100">{formatDateTimeWIB(attendance.updated_at) || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Captured Image Section */}
                {attendance.image_captured_url && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Foto Kehadiran</h3>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg flex justify-center">
                            <div className="max-w-md">
                                <img
                                    src={getFullImageUrl(attendance.image_captured_url)}
                                    alt="Foto Kehadiran"
                                    className="rounded-lg shadow-md max-h-96 object-contain"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                                    Foto diambil saat check-in
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Face Verification Section */}
                {attendance.face_verification_data && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Verifikasi Wajah</h3>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status Verifikasi</p>
                                    <p className="font-medium dark:text-gray-100">{faceDetails.verified}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Senyum Terdeteksi</p>
                                    <p className="font-medium dark:text-gray-100">
                                        {attendance.smile_detected ? 'Ya' : 'Tidak'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat Kepercayaan</p>
                                    <p className="font-medium dark:text-gray-100">{faceDetails.confidence}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Nama Prediksi</p>
                                    <p className="font-medium dark:text-gray-100">{faceDetails.predictedName}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Waktu Verifikasi</p>
                                    <p className="font-medium dark:text-gray-100">{faceDetails.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Location Data Section */}
                {attendance.location_data && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 dark:text-white text-gray-900">Data Lokasi</h3>
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Latitude</p>
                                    <p className="font-medium dark:text-gray-100">{locationDetails.latitude}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Longitude</p>
                                    <p className="font-medium dark:text-gray-100">{locationDetails.longitude}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Waktu Pencatatan Lokasi</p>
                                    <p className="font-medium dark:text-gray-100">{locationDetails.timestamp}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AttendanceDetailModal;