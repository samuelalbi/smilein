import React, { useRef, useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { ScheduleRead, ScheduleUpdate } from '../../types/schedule';
import Swal from 'sweetalert2';
import * as courseApi from '../../api/courseApi';
import * as instructorApi from '../../api/instructorApi';
import * as roomApi from '../../api/roomApi';
import { Room } from '../../types/room';

interface UpdateScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSchedule: ScheduleRead | null;
    onUpdateSchedule: (scheduleId: number, scheduleData: ScheduleUpdate) => Promise<void>;
}

interface Course {
    course_id: number;
    course_name: string;
}

interface Instructor {
    instructor_id: number;
    full_name: string;
}

const UpdateScheduleModal: React.FC<UpdateScheduleModalProps> = ({
    isOpen,
    onClose,
    currentSchedule,
    onUpdateSchedule
}) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDataReady, setIsDataReady] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const courseIdRef = useRef<HTMLSelectElement>(null);
    const instructorIdRef = useRef<HTMLSelectElement>(null);
    const roomIdRef = useRef<HTMLSelectElement>(null);
    const chapterRef = useRef<HTMLInputElement>(null);
    const startTimeRef = useRef<HTMLInputElement>(null);
    const endTimeRef = useRef<HTMLInputElement>(null);
    const scheduleDateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsDataReady(false);
            setError(null);
            fetchAllData();
        } else {
            // Reset state when modal closes
            setIsDataReady(false);
            setCourses([]);
            setInstructors([]);
            setRooms([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (currentSchedule && isOpen && isDataReady) {
            // Populate form fields after data is ready
            populateFormFields();
        }
    }, [currentSchedule, isOpen, isDataReady]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data concurrently
            const [fetchedCourses, fetchedInstructors, fetchedRooms] = await Promise.all([
                courseApi.getCourses(),
                instructorApi.getInstructors(),
                roomApi.getRooms()
            ]);

            setCourses(fetchedCourses);
            setInstructors(fetchedInstructors);
            setRooms(fetchedRooms);
            setIsDataReady(true);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Gagal memuat data. Silakan coba lagi.');
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat data. Silakan tutup modal dan coba lagi.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const populateFormFields = () => {
        setTimeout(() => {
            if (courseIdRef.current && currentSchedule?.course) {
                courseIdRef.current.value = currentSchedule.course.course_id.toString();
            }
            if (instructorIdRef.current && currentSchedule?.instructor) {
                instructorIdRef.current.value = currentSchedule.instructor.instructor_id.toString();
            }
            if (roomIdRef.current && currentSchedule?.room) {
                roomIdRef.current.value = currentSchedule.room.room_id.toString();
            }
            if (chapterRef.current) {
                chapterRef.current.value = currentSchedule?.chapter || '';
            }
            if (startTimeRef.current) {
                startTimeRef.current.value = currentSchedule?.start_time || '';
            }
            if (endTimeRef.current) {
                endTimeRef.current.value = currentSchedule?.end_time || '';
            }
            if (scheduleDateRef.current && currentSchedule?.schedule_date) {
                const formattedDate = new Date(currentSchedule.schedule_date)
                    .toISOString()
                    .split('T')[0];
                scheduleDateRef.current.value = formattedDate;
            }
        }, 100);
    };

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

    const validateInputs = (): boolean => {
        const courseId = courseIdRef.current?.value;
        const instructorId = instructorIdRef.current?.value;
        const roomId = roomIdRef.current?.value;
        const startTime = startTimeRef.current?.value;
        const endTime = endTimeRef.current?.value;
        const scheduleDate = scheduleDateRef.current?.value;

        if (!courseId || courseId === '') {
            showAlert('Validasi Error', 'Pilih mata kuliah', 'error');
            return false;
        }
        if (!instructorId || instructorId === '') {
            showAlert('Validasi Error', 'Pilih dosen', 'error');
            return false;
        }
        if (!roomId || roomId === '') {
            showAlert('Validasi Error', 'Pilih ruangan', 'error');
            return false;
        }
        if (!startTime) {
            showAlert('Validasi Error', 'Masukkan waktu mulai', 'error');
            return false;
        }
        if (!endTime) {
            showAlert('Validasi Error', 'Masukkan waktu selesai', 'error');
            return false;
        }
        if (!scheduleDate) {
            showAlert('Validasi Error', 'Masukkan tanggal jadwal', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (): Promise<void> => {
        try {
            if (!currentSchedule || !currentSchedule.schedule_id) {
                showAlert('Error', 'Data jadwal tidak valid', 'error');
                return;
            }

            if (!validateInputs()) {
                return;
            }

            setLoading(true);
            setError(null);

            const courseId = parseInt(courseIdRef.current?.value || '0', 10);
            const instructorId = parseInt(instructorIdRef.current?.value || '0', 10);
            const roomId = parseInt(roomIdRef.current?.value || '0', 10);
            const chapter = chapterRef.current?.value?.trim() || '';
            const startTime = startTimeRef.current?.value || '';
            const endTime = endTimeRef.current?.value || '';
            const scheduleDate = scheduleDateRef.current?.value || '';

            console.log('Updating schedule data:', {
                course_id: courseId,
                instructor_id: instructorId,
                room_id: roomId,
                chapter,
                start_time: startTime,
                end_time: endTime,
                schedule_date: scheduleDate
            });

            await onUpdateSchedule(currentSchedule.schedule_id, {
                course_id: courseId,
                instructor_id: instructorId,
                room_id: roomId,
                chapter,
                start_time: startTime,
                end_time: endTime,
                schedule_date: scheduleDate
            });

            onClose();
        } catch (error: unknown) {
            console.error('Error updating schedule:', error);
            let errorMessage = 'Gagal memperbarui jadwal.';
            if (error instanceof Error) {
                errorMessage = `Gagal memperbarui jadwal: ${error.message}`;
            }
            setError(errorMessage);
            showAlert('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Loading component
    const LoadingContent = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Memuat data...</p>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Jadwal"
            onConfirm={!loading && isDataReady ? handleSubmit : undefined}
        >
            {loading && !isDataReady ? (
                <LoadingContent />
            ) : error && !isDataReady ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md text-center">
                        <p className="font-semibold">Error memuat data</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            ) : (
                <>
                    {loading && (
                        <div className="flex justify-center py-2 mb-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mata Kuliah</label>
                            <select
                                ref={courseIdRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            >
                                <option value="">Pilih Mata Kuliah</option>
                                {courses.map((course) => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dosen</label>
                            <select
                                ref={instructorIdRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            >
                                <option value="">Pilih Dosen</option>
                                {instructors.map((instructor) => (
                                    <option key={instructor.instructor_id} value={instructor.instructor_id}>
                                        {instructor.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ruangan</label>
                            <select
                                ref={roomIdRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            >
                                <option value="">Pilih Ruangan</option>
                                {rooms.map((room) => (
                                    <option key={room.room_id} value={room.room_id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bab/Materi</label>
                            <input
                                ref={chapterRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                placeholder="Masukkan bab/materi (opsional)"
                                disabled={loading || !isDataReady}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Jadwal</label>
                            <input
                                ref={scheduleDateRef}
                                type="date"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Waktu Mulai</label>
                            <input
                                ref={startTimeRef}
                                type="time"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Waktu Selesai</label>
                            <input
                                ref={endTimeRef}
                                type="time"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                                disabled={loading || !isDataReady}
                            />
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default UpdateScheduleModal;