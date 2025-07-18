import React, { useState, useEffect, useMemo } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import * as scheduleApi from '../../api/scheduleApi';
import { ScheduleRead, ScheduleCreate, ScheduleUpdate } from '../../types/schedule';
import Swal from 'sweetalert2';
import CreateScheduleModal from '../../components/Schedule/CreateScheduleModal';
import UpdateScheduleModal from '../../components/Schedule/UpdateScheduleModal';
import { format } from 'date-fns';

const Schedules: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleRead[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = (): string => {
        const today = new Date();
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jakarta'
        }).format(today);
    };

    // Filter states - set default date to today
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [searchChapter, setSearchChapter] = useState('');

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
    const [currentSchedule, setCurrentSchedule] = useState<ScheduleRead | null>(null);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await scheduleApi.getSchedules();

            // Sort schedules by date in descending order (newest first)
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.schedule_date);
                const dateB = new Date(b.schedule_date);
                return dateB.getTime() - dateA.getTime();
            });

            setSchedules(sortedData);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
            setError('Failed to load schedules. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique options for filter dropdowns
    const courseOptions = useMemo(() => {
        const uniqueCourses = new Set<string>();
        schedules.forEach(schedule => {
            if (schedule.course?.course_name) {
                uniqueCourses.add(schedule.course.course_name);
            }
        });
        return Array.from(uniqueCourses);
    }, [schedules]);

    const instructorOptions = useMemo(() => {
        const uniqueInstructors = new Set<string>();
        schedules.forEach(schedule => {
            if (schedule.instructor?.full_name) {
                uniqueInstructors.add(schedule.instructor.full_name);
            }
        });
        return Array.from(uniqueInstructors);
    }, [schedules]);

    const roomOptions = useMemo(() => {
        const uniqueRooms = new Set<string>();
        schedules.forEach(schedule => {
            if (schedule.room?.name) {
                uniqueRooms.add(schedule.room.name);
            }
        });
        return Array.from(uniqueRooms);
    }, [schedules]);

    // Filter schedules based on selected filters and sort by date descending
    const filteredSchedules = useMemo(() => {
        const filtered = schedules.filter(schedule => {
            const matchesDate = !selectedDate || schedule.schedule_date === selectedDate;
            const matchesCourse = !selectedCourse || schedule.course?.course_name === selectedCourse;
            const matchesInstructor = !selectedInstructor || schedule.instructor?.full_name === selectedInstructor;
            const matchesRoom = !selectedRoom || schedule.room?.name === selectedRoom;
            const matchesChapter = !searchChapter ||
                (schedule.chapter && schedule.chapter.toLowerCase().includes(searchChapter.toLowerCase()));

            return matchesDate && matchesCourse && matchesInstructor && matchesRoom && matchesChapter;
        });

        // Sort filtered results by date in descending order (newest first)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.schedule_date);
            const dateB = new Date(b.schedule_date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [schedules, selectedDate, selectedCourse, selectedInstructor, selectedRoom, searchChapter]);

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

    const handleCreateSchedule = async (scheduleData: ScheduleCreate): Promise<void> => {
        try {
            const newSchedule = await scheduleApi.createSchedule(scheduleData);

            // Add new schedule and re-sort the entire array
            const updatedSchedules = [...schedules, newSchedule].sort((a, b) => {
                const dateA = new Date(a.schedule_date);
                const dateB = new Date(b.schedule_date);
                return dateB.getTime() - dateA.getTime();
            });

            setSchedules(updatedSchedules);
            setCreateModalOpen(false);
            showAlert('Berhasil!', 'Jadwal baru telah ditambahkan', 'success');
        } catch (err) {
            console.error('Failed to create schedule:', err);
            throw err; // Rethrow to be caught by modal component
        }
    };

    const handleUpdateSchedule = async (scheduleId: number, scheduleData: ScheduleUpdate): Promise<void> => {
        try {
            const updatedSchedule = await scheduleApi.updateSchedule(scheduleId, scheduleData);

            // Update schedule and re-sort the entire array
            const updatedSchedules = schedules.map(s =>
                s.schedule_id === scheduleId ? updatedSchedule : s
            ).sort((a, b) => {
                const dateA = new Date(a.schedule_date);
                const dateB = new Date(b.schedule_date);
                return dateB.getTime() - dateA.getTime();
            });

            setSchedules(updatedSchedules);
            setUpdateModalOpen(false);
            showAlert('Berhasil!', 'Jadwal telah diperbarui', 'success');
        } catch (err) {
            console.error('Failed to update schedule:', err);
            throw err; // Rethrow to be caught by modal component
        }
    };

    const handleUpdateClick = (schedule: ScheduleRead): void => {
        setCurrentSchedule(schedule);
        setUpdateModalOpen(true);
    };

    const handleDeleteClick = (schedule: ScheduleRead): void => {
        setCurrentSchedule(schedule);
        Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: `Apakah anda yakin ingin menghapus jadwal "${schedule.course?.course_name || ''}" di ruangan ${schedule.room?.name || ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteConfirm(schedule.schedule_id);
            }
        });
    };

    const handleDeleteConfirm = async (scheduleId: number): Promise<void> => {
        try {
            setLoading(true);
            await scheduleApi.deleteSchedule(scheduleId);

            // Remove deleted schedule (array remains sorted)
            setSchedules(schedules.filter(s => s.schedule_id !== scheduleId));
            showAlert('Terhapus!', 'Jadwal telah dihapus.', 'success');
        } catch (error: unknown) {
            console.error('Failed to delete schedule:', error);
            let errorMessage = 'Gagal menghapus jadwal.';
            if (error instanceof Error) {
                errorMessage = `Gagal menghapus jadwal sedang digunakan`;
            }
            showAlert('Error', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    const scheduleColumns: Column[] = [
        // {
        //     header: 'ID Jadwal',
        //     accessor: 'schedule_id',
        //     minWidth: '100px',
        // },
        {
            header: 'Tanggal',
            accessor: 'schedule_date',
            minWidth: '150px',
            cell: (item: ScheduleRead) => formatDate(item.schedule_date)
        },
        {
            header: 'Mata Kuliah',
            accessor: 'course.course_name',
            minWidth: '200px',
            cell: (item: ScheduleRead) => item.course?.course_name || 'N/A'
        },
        {
            header: 'Dosen',
            accessor: 'instructor.full_name',
            minWidth: '200px',
            cell: (item: ScheduleRead) => item.instructor?.full_name || 'N/A'
        },
        {
            header: 'Bab/Materi',
            accessor: 'chapter',
            minWidth: '150px',
            cell: (item: ScheduleRead) => item.chapter || '-'
        },
        {
            header: 'Waktu',
            accessor: 'time',
            minWidth: '150px',
            cell: (item: ScheduleRead) => `${item.start_time} - ${item.end_time}`
        },

        {
            header: 'Ruangan',
            accessor: 'room.name',
            minWidth: '120px',
            cell: (item: ScheduleRead) => item.room?.name || 'N/A'
        },
        {
            header: 'Tanggal Dibuat',
            accessor: 'created_at',
            minWidth: '150px',
            cell: (item: ScheduleRead) => (
                <span>
                    {new Date(item.created_at ?? '').toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            ),
        }
    ];

    // Render function to handle different data states
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (error) {
            return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
        }

        // // No schedule data matches filters
        // if (filteredSchedules.length === 0) {
        //     return (
        //         <div className="text-center py-8">
        //             <p className="text-gray-600 dark:text-gray-300">Tidak ada data jadwal yang sesuai dengan filter yang dipilih.</p>
        //             <button
        //                 onClick={resetFilters}
        //                 className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        //             >
        //                 Reset Filter
        //             </button>
        //         </div>
        //     );
        // }

        // We have data to display
        return (
            <DynamicTable
                columns={scheduleColumns}
                data={filteredSchedules}
                className="shadow-sm"
                searchable={false}
                filterable={true}
                disableBuiltInFilter={true}
                renderActions={(schedule: ScheduleRead) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleUpdateClick(schedule)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteClick(schedule)}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                        >
                            Hapus
                        </button>
                    </div>
                )}
            />
        );
    };

    return (
        <div className="space-y-8 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Daftar Jadwal</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        Tambah Jadwal
                    </button>
                </div>
            </div>

            {/* Custom Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Tanggal
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 outline-none focus:border-primary shadow-sm"
                    />
                    <small className="text-xs text-gray-500 dark:text-gray-400">
                        Default: Hari ini ({formatDate(getTodayDate())})
                    </small>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Mata Kuliah
                    </label>
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 pr-10 outline-none focus:border-primary appearance-none shadow-sm"
                        >
                            <option value="">Semua Mata Kuliah</option>
                            {courseOptions.map((course, index) => (
                                <option key={index} value={course}>{course}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Dosen
                    </label>
                    <div className="relative">
                        <select
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 pr-10 outline-none focus:border-primary appearance-none shadow-sm"
                        >
                            <option value="">Semua Dosen</option>
                            {instructorOptions.map((instructor, index) => (
                                <option key={index} value={instructor}>{instructor}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Ruangan
                    </label>
                    <div className="relative">
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 pr-10 outline-none focus:border-primary appearance-none shadow-sm"
                        >
                            <option value="">Semua Ruangan</option>
                            {roomOptions.map((room, index) => (
                                <option key={index} value={room}>{room}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Cari Bab/Materi
                    </label>
                    <input
                        type="text"
                        placeholder="Masukkan bab/materi..."
                        value={searchChapter}
                        onChange={(e) => setSearchChapter(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 outline-none focus:border-primary shadow-sm"
                    />
                </div>
            </div>

            {renderContent()}

            <CreateScheduleModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreateSchedule={handleCreateSchedule}
            />

            <UpdateScheduleModal
                isOpen={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                currentSchedule={currentSchedule}
                onUpdateSchedule={handleUpdateSchedule}
            />
        </div>
    );
};

export default Schedules;