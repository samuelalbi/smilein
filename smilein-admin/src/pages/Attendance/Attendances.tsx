import React, { useState, useEffect, useMemo } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import AttendanceDetailModal from '../../components/Attendances/DetailAttendanceModal';
import CreateAttendanceModal from '../../components/Attendances/CreateAttendanceModel';
import UpdateAttendanceModal from '../../components/Attendances/EditAttendanceModal';
import { getAttendances, updateAttendance, deleteAttendance } from '../../api/attendanceApi';
import { getInstructorCourse } from '../../api/instructorCourseApi';
import { AttendanceWithScheduleRead, AttendanceUpdate } from '../../types/attendance';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';

// Define the token structure
interface DecodedToken {
    user_id: number;
    user_type: string; // Add role to check if user is admin
    // Add other properties from your token if needed
}

// Define the instructor course structure based on the log output
interface InstructorCourse {
    instructor_id: number;
    course_id: number;
    instructor_course_id: number;
    created_at: string;
    instructor: {
        nidn: string;
        full_name: string;
        username: string;
        email: string;
        phone_number: string;
        profile_picture_url: string;
    };
    course: {
        course_name: string;
        sks: number;
    } | null; // Allow null for course property
}

// Define InstructorCourseRead type to match API response
interface InstructorCourseRead {
    instructor_id: number;
    course_id: number;
    instructor_course_id: number;
    created_at: string;
    instructor: {
        nidn: string;
        full_name: string;
        username: string;
        email: string;
        phone_number: string;
        profile_picture_url: string;
    };
    course: {
        course_id: number;
        course_name: string;
        sks: number;
        created_at: string;
    } | null;
}

// Helper function to convert InstructorCourseRead to InstructorCourse
const convertToInstructorCourse = (apiData: InstructorCourseRead): InstructorCourse => {
    return {
        instructor_id: apiData.instructor_id,
        course_id: apiData.course_id,
        instructor_course_id: apiData.instructor_course_id,
        created_at: apiData.created_at,
        instructor: apiData.instructor,
        course: apiData.course ? {
            course_name: apiData.course.course_name,
            sks: apiData.course.sks
        } : null
    };
};

const AttendanceHistory: React.FC = () => {
    const [attendances, setAttendances] = useState<AttendanceWithScheduleRead[]>([]);
    const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchNim, setSearchNim] = useState('');
    const [searchName, setSearchName] = useState('');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [currentAttendance, setCurrentAttendance] = useState<AttendanceWithScheduleRead | null>(null);
    const [instructorId, setInstructorId] = useState<number | null>(null);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add state to track if user is admin

    useEffect(() => {
        // Get the instructor_id from the token when component mounts
        const fetchInstructorId = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    setInstructorId(decoded.user_id);

                    // Check if user is admin
                    const userIsAdmin = decoded.user_type === 'admin';
                    setIsAdmin(userIsAdmin);

                    // For instructors, fetch their courses
                    // For admins, we still fetch instructor courses for the course filter dropdown
                    if (!userIsAdmin || true) { // Always fetch courses for filtering purposes
                        try {
                            const course = await getInstructorCourse(decoded.user_id);

                            // Handle the response properly - wrap in array if it's a single object
                            if (course) {
                                const coursesArray = Array.isArray(course) ? course : [course];
                                // Convert API response to our local type
                                const convertedCourses = coursesArray.map(convertToInstructorCourse);
                                setInstructorCourses(convertedCourses);
                            } else {
                                setInstructorCourses([]);
                            }
                        } catch (error) {
                            console.error('Failed to fetch instructor courses:', error);
                            setInstructorCourses([]); // Set empty array on error
                            // Don't show error message, just set empty array
                        }
                    }

                    setDataFetched(true);
                }
                catch (error) {
                    console.error("Error decoding token:", error);
                    localStorage.removeItem('token');
                    setDataFetched(true);
                }
            } else {
                console.log("Token tidak ditemukan di localStorage");
                setDataFetched(true);
            }
        };

        fetchInstructorId();
    }, []);

    useEffect(() => {
        if (instructorId !== null) {
            fetchAttendances();
        }
    }, [instructorId]);

    const fetchAttendances = async () => {
        try {
            setLoading(true);
            const response = await getAttendances();
            // Handle null, undefined or non-array responses gracefully
            if (response && Array.isArray(response)) {
                // Sort attendances by date in descending order (newest first)
                const sortedAttendances = response.sort((a, b) => {
                    const dateA = new Date(a.schedule?.schedule_date || a.date || '');
                    const dateB = new Date(b.schedule?.schedule_date || b.date || '');
                    return dateB.getTime() - dateA.getTime();
                });
                setAttendances(sortedAttendances);
            } else {
                // If response is not as expected, set empty array
                setAttendances([]);
            }
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
            // Don't show error alert to the user, just set empty array
            setAttendances([]);
        } finally {
            setLoading(false);
            setDataFetched(true);
        }
    };

    // Extract unique course names for the filter dropdown
    const courseOptions = useMemo(() => {
        // Create a set of course names from all attendances (for admin) and instructorCourses
        const uniqueCourses = new Set<string>();

        // If admin, add course names from all attendances
        if (isAdmin) {
            attendances.forEach(attendance => {
                if (attendance.schedule?.course?.course_name) {
                    uniqueCourses.add(attendance.schedule.course.course_name);
                }
            });
        }

        // Add course names from the instructorCourses array
        instructorCourses.forEach(course => {
            if (course.course && course.course.course_name) {
                uniqueCourses.add(course.course.course_name);
            }
        });

        return Array.from(uniqueCourses);
    }, [attendances, instructorCourses, isAdmin]);

    // Filter attendances based on selected filters
    // For admin: show all attendances
    // For instructor: show only their assigned course attendances
    const filteredAttendances = useMemo(() => {
        // First apply the user role filter
        let roleFilteredAttendances = attendances;

        // If not admin, filter by instructor's courses
        if (!isAdmin) {
            // Get the set of instructor_course_ids for this instructor
            const instructorCourseIds = new Set(
                instructorCourses.map(course => course.instructor_course_id)
            );

            // Filter attendances to only those from this instructor's courses
            roleFilteredAttendances = attendances.filter(attendance => {
                return attendance.schedule?.instructor.instructor_id &&
                    instructorCourseIds.has(attendance.schedule.instructor.instructor_id);
            });
        }

        // Then apply the user-selected filters
        const filtered = roleFilteredAttendances.filter(attendance => {
            const matchesDate = !selectedDate || attendance.date === selectedDate;
            const matchesCourse = !selectedCourse ||
                (attendance.schedule?.course?.course_name === selectedCourse);
            const matchesStatus = !selectedStatus || attendance.status === selectedStatus;

            // Separate filters for studentId and studentName
            const matchesNim = !searchNim ||
                (attendance.student?.nim && attendance.student.nim.toLowerCase().includes(searchNim.toLowerCase()));
            const matchesName = !searchName ||
                (attendance.student?.full_name && attendance.student.full_name.toLowerCase().includes(searchName.toLowerCase()));

            return matchesDate && matchesCourse && matchesStatus && matchesNim && matchesName;
        });

        // Sort filtered results by date in descending order (newest first)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.schedule?.schedule_date || a.date || '');
            const dateB = new Date(b.schedule?.schedule_date || b.date || '');
            return dateB.getTime() - dateA.getTime();
        });
    }, [attendances, selectedDate, selectedCourse, selectedStatus, searchNim, searchName, instructorCourses, isAdmin]);

    const handleShowDetails = (attendance: AttendanceWithScheduleRead) => {
        setCurrentAttendance(attendance);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (attendance: AttendanceWithScheduleRead) => {
        setCurrentAttendance(attendance);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (attendance: AttendanceWithScheduleRead) => {
        // Konfirmasi penghapusan dengan SweetAlert2
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Hapus data kehadiran untuk ${attendance.student?.full_name || '-'} pada ${formatDate(attendance.date)}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3B82F6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'

        });

        // Jika pengguna membatalkan, tidak melakukan apa-apa
        if (!result.isConfirmed) {
            return;
        }

        try {
            // Panggil API untuk menghapus data
            await deleteAttendance(attendance.attendance_id);

            // Refresh data setelah penghapusan berhasil
            await fetchAttendances();

            // Tampilkan pesan sukses
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data kehadiran berhasil dihapus',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3B82F6'
            });
        } catch (error) {
            console.error('Failed to delete attendance:', error);

            // Tampilkan pesan error
            await Swal.fire({
                title: 'Error!',
                text: 'Gagal menghapus data kehadiran',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3B82F6'
            });
        }
    };

    const handleUpdateAttendance = async (attendanceId: number, attendanceData: AttendanceUpdate): Promise<void> => {
        try {
            // Update attendance via API
            await updateAttendance(attendanceId, attendanceData);

            // Instead of using the API response, update only the specific fields in the existing data
            // This preserves all the relational data (schedule, student, etc.)
            const updatedAttendances = attendances.map(attendance => {
                if (attendance.attendance_id === attendanceId) {
                    // Only update the fields that were actually changed
                    return {
                        ...attendance, // Keep all existing data
                        ...attendanceData, // Only override the updated fields
                        attendance_id: attendance.attendance_id,
                        schedule: attendance.schedule,
                        student: attendance.student,
                        // Ensure status is not null
                        status: attendanceData.status || attendance.status || 'ABSENT'
                    };
                }
                return attendance;
            }).sort((a, b) => {
                const dateA = new Date(a.schedule?.schedule_date || a.date || '');
                const dateB = new Date(b.schedule?.schedule_date || b.date || '');
                return dateB.getTime() - dateA.getTime();
            });

            setAttendances(updatedAttendances);

            // Show success alert
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data kehadiran berhasil diperbarui',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3B82F6'
            });
        } catch (error) {
            console.error('Failed to update attendance:', error);
            await Swal.fire({
                title: 'Error!',
                text: 'Gagal memperbarui data kehadiran',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3B82F6'
            });
        }
    };

    const handleCreateAttendanceSuccess = async () => {
        // Refresh data after creating new attendance
        await fetchAttendances();
    };

    // Format date as day/month/year
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Format time
    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        return timeString;
    };

    // Map status to display values and styles
    const getStatusDisplay = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PRESENT':
                return {
                    text: 'Hadir',
                    className: 'bg-green-100 text-green-800'
                };
            case 'LATE':
                return {
                    text: 'Terlambat',
                    className: 'bg-yellow-100 text-yellow-800'
                };
            case 'ABSENT':
                return {
                    text: 'Tidak Hadir',
                    className: 'bg-red-100 text-red-800'
                };
            default:
                return {
                    text: status,
                    className: 'bg-gray-100 text-gray-800'
                };
        }
    };

    const attendanceColumns: Column[] = [
        {
            header: 'NIM',
            accessor: 'student.nim',
            minWidth: '120px',
            cell: (item: AttendanceWithScheduleRead) => (
                <span>
                    {item.student?.nim || '-'}
                </span>
            )
        },
        {
            header: 'Nama',
            accessor: 'student.full_name',
            minWidth: '200px',
            cell: (item: AttendanceWithScheduleRead) => (
                <span>
                    {item.student?.full_name || '-'}
                </span>
            )
        },
        {
            header: 'Mata Kuliah',
            accessor: 'schedule.course.course_name',
            minWidth: '200px',
            cell: (item: AttendanceWithScheduleRead) => (
                <span>
                    {item.schedule?.course?.course_name || '-'}
                </span>
            )
        },
        {
            header: 'Tanggal',
            accessor: 'date',
            minWidth: '120px',
            cell: (item: AttendanceWithScheduleRead) => {
                // Check multiple possible date sources and handle undefined/null values
                const dateToFormat = item.schedule?.schedule_date || item.date;
                return (
                    <span>
                        {dateToFormat ? formatDate(dateToFormat) : '-'}
                    </span>
                );
            }
        },
        {
            header: 'Check-in',
            accessor: 'check_in_time',
            minWidth: '120px',
            cell: (item: AttendanceWithScheduleRead) => (
                <span>
                    {formatTime(item.check_in_time)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            minWidth: '120px',
            cell: (item: AttendanceWithScheduleRead) => {
                const status = getStatusDisplay(item.status);
                return (
                    <span className={`px-2 py-1 rounded-full text-sm ${status.className}`}>
                        {status.text}
                    </span>
                );
            }
        }
    ];

    // Add instructor name column for admin users
    if (isAdmin) {
        attendanceColumns.splice(3, 0, {
            header: 'Dosen',
            accessor: 'schedule.instructor.full_name',
            minWidth: '200px',
            cell: (item: AttendanceWithScheduleRead) => (
                <span>
                    {item.schedule?.instructor?.full_name || '-'}
                </span>
            )
        });
    }

    // Render function to handle different data states
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        // If instructor and no courses assigned
        if (!isAdmin && instructorCourses.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">Anda belum ditugaskan untuk mengajar mata kuliah apapun.</p>
                </div>
            );
        }

        // We have data to display
        return (
            <DynamicTable
                columns={attendanceColumns}
                data={filteredAttendances}
                className="shadow-sm"
                searchable={false} // Disable built-in search since we have our own
                filterable={true}
                disableBuiltInFilter={true} // Disable built-in filtering
                renderActions={(attendance: AttendanceWithScheduleRead) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleShowDetails(attendance)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Detail
                        </button>
                        <button
                            onClick={() => handleEdit(attendance)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(attendance)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
                <h2 className="text-xl font-semibold">Riwayat Kehadiran</h2>
                <div className="flex space-x-2">
                    {/* Only show Add Attendance button if user is admin */}
                    {isAdmin && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg  hover:bg-green-600 text-sm flex items-center transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700"
                        >
                            Tambah Kehadiran
                        </button>
                    )}
                </div>
            </div>

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
                        Status Kehadiran
                    </label>
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 pr-10 outline-none focus:border-primary appearance-none shadow-sm"
                        >
                            <option value="">Semua Status</option>
                            <option value="PRESENT">Hadir</option>
                            <option value="LATE">Terlambat</option>
                            <option value="ABSENT">Tidak Hadir</option>
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
                        Cari NIM
                    </label>
                    <input
                        type="text"
                        placeholder="Masukkan NIM..."
                        value={searchNim}
                        onChange={(e) => setSearchNim(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 outline-none focus:border-primary shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                        Cari Nama
                    </label>
                    <input
                        type="text"
                        placeholder="Masukkan nama mahasiswa..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-2 outline-none focus:border-primary shadow-sm"
                    />
                </div>
            </div>

            {renderContent()}

            {/* Detail Modal */}
            {currentAttendance && (
                <AttendanceDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    attendance={currentAttendance}
                />
            )}

            {/* Create Modal - Only render if user is admin */}
            {isAdmin && (
                <CreateAttendanceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateAttendanceSuccess}
                />
            )}

            {/* Update Modal */}
            {currentAttendance && (
                <UpdateAttendanceModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    currentAttendance={currentAttendance}
                    onUpdateAttendance={handleUpdateAttendance}
                />
            )}
        </div>
    );
};

export default AttendanceHistory;