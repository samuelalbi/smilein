import React, { useRef, useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { ScheduleCreate } from '../../types/schedule';
import Swal from 'sweetalert2';
import * as courseApi from '../../api/courseApi';
import * as instructorApi from '../../api/instructorApi';
import * as roomApi from '../../api/roomApi';
import { Room } from '../../types/room';

interface CreateScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateSchedule: (scheduleData: ScheduleCreate) => Promise<void>;
}

interface Course {
    course_id: number;
    course_name: string;
}

interface Instructor {
    instructor_id: number;
    full_name: string;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
    isOpen,
    onClose,
    onCreateSchedule
}) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
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
            fetchCourses();
            fetchInstructors();
            fetchRooms();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const fetchedCourses = await courseApi.getCourses();
            setCourses(fetchedCourses);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError('Failed to load courses');
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat daftar mata kuliah',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const fetchedInstructors = await instructorApi.getInstructors();
            setInstructors(fetchedInstructors);
        } catch (error) {
            console.error('Failed to fetch instructors:', error);
            setError('Failed to load instructors');
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat daftar dosen',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const fetchedRooms = await roomApi.getRooms();
            setRooms(fetchedRooms);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setError('Failed to load rooms');
            Swal.fire({
                title: 'Error',
                text: 'Gagal memuat daftar ruangan',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
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

            console.log('Submitting schedule data:', {
                course_id: courseId,
                instructor_id: instructorId,
                room_id: roomId,
                chapter,
                start_time: startTime,
                end_time: endTime,
                schedule_date: scheduleDate
            });

            await onCreateSchedule({
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
            console.error('Error creating schedule:', error);
            let errorMessage = 'Gagal membuat jadwal.';
            if (error instanceof Error) {
                errorMessage = `Gagal membuat jadwal: ${error.message}`;
            }
            setError(errorMessage);
            showAlert('Error!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Jadwal Baru"
            onConfirm={handleSubmit}
        >
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Jadwal</label>
                    <input
                        ref={scheduleDateRef}
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Waktu Mulai</label>
                    <input
                        ref={startTimeRef}
                        type="time"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        required
                        disabled={loading}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Waktu Selesai</label>
                    <input
                        ref={endTimeRef}
                        type="time"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        required
                        disabled={loading}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default CreateScheduleModal;