import React, { useState, useEffect } from 'react';
import { StudentRead, StudentUpdate } from '../../types/student';
import About from '../../components/User/About';
import Schedule from '../../components/User/Schedule';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, getNextStudent, updateStudent, getStudentProfilePicture } from '../../api/studentApi';
import Swal from 'sweetalert2';
import UpdateStudentModal from '../../components/User/UpdateStudentModal';

const StudentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<StudentRead | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('About');
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    const tabs: string[] = [
        'About',
        'Schedule',
    ];

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                if (id) {
                    const student = await getStudent(parseInt(id, 10));
                    setStudentData(student);

                    // Fetch profile picture
                    try {
                        const pictureData = await getStudentProfilePicture(parseInt(id, 10));
                        if (pictureData && pictureData.profile_picture_url) {
                            setProfilePicture(formatImageUrl(pictureData.profile_picture_url));
                        }
                    } catch (err) {
                        console.log('No profile picture found, using initials');
                        // We'll use initials as fallback, so no need to set error
                    }
                }
            } catch (err) {
                console.error('Failed to fetch student details', err);
                setError('Failed to load student details');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [id]);

    // Helper function to format image URL
    const formatImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('/')) return `https://web-production-b963.up.railway.app${url}`;
        return url;
    };

    const handleNextStudent = async () => {
        // If currently loading or navigating, don't do anything
        if (loading || isNavigating || !studentData?.student_id) return;

        try {
            setIsNavigating(true);

            // Call API to get the next student
            const nextStudent = await getNextStudent(studentData.student_id);

            // Navigate to the next student's page
            navigate(`/student/student-list/${nextStudent.student_id}`);

            // If next student is the same as current (only one data in database)
            if (nextStudent.student_id === studentData.student_id) {
                Swal.fire({
                    title: 'Info',
                    text: 'Hanya ada satu student dalam database',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (err) {
            console.error('Failed to navigate to next student', err);

            // Show error message with SweetAlert2
            Swal.fire({
                title: 'Error!',
                text: 'Gagal mendapatkan data student berikutnya',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsNavigating(false);
        }
    };

    const handleUpdateStudent = async (studentId: number, updateData: StudentUpdate) => {
        try {
            // Validate data before sending
            const validatedData = validateStudentUpdate(updateData);

            const updatedStudent = await updateStudent(studentId, validatedData);
            setStudentData(updatedStudent);
            setIsUpdateModalOpen(false);

            // Show SweetAlert2 success notification
            Swal.fire({
                title: 'Success!',
                text: 'Data mahasiswa berhasil diperbarui',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error: any) {
            console.error('Failed to update student:', error);

            // Show SweetAlert2 error notification
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Gagal memperbarui data mahasiswa',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    };

    // Validation helper function
    function validateStudentUpdate(data: StudentUpdate): StudentUpdate {
        // Make sure we have at least one field to update
        if (Object.keys(data).length === 0) {
            throw new Error('No update data provided');
        }

        // Only validate fields that are present
        if (data.username === '') {
            throw new Error('Username cannot be empty');
        }

        if (data.full_name === '') {
            throw new Error('Full name cannot be empty');
        }

        return data;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'About':
                return <About studentData={studentData} />;
            case 'Schedule':
                return <Schedule studentData={studentData} />;
           
            default:
                return (
                    <div className="mt-6 p-4 md:p-6 border dark:border-gray-700 rounded-lg dark:bg-gray-800">
                        <h2 className="text-lg font-semibold mb-4 dark:text-white">{activeTab}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{activeTab} content will be displayed here.</p>
                    </div>
                );
        }
    };

    const getInitials = (name?: string): string => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-gray-900">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Profile Picture */}
                {profilePicture ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden">
                        <img
                            src={profilePicture}
                            alt={`${studentData?.full_name} profile`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl md:text-2xl text-white">
                            {getInitials(studentData?.full_name)}
                        </span>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold dark:text-white truncate">{studentData?.full_name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{studentData?.major_name || 'Student'}</p>
                        </div>
                        <div className="flex gap-2">
                            {/* Edit Icon */}
                            <button
                                onClick={() => setIsUpdateModalOpen(true)}
                                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-5 h-5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>

                            {/* Next Icon */}
                            <button
                                onClick={handleNextStudent}
                                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={loading || isNavigating}
                            >
                                {isNavigating ? (
                                    // Loading spinner when navigating
                                    <svg className="w-5 h-5 dark:text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 truncate">{studentData?.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">{studentData?.nim}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">{studentData?.year || 'Not available'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b dark:border-gray-700 overflow-x-auto">
                <nav className="flex gap-4 md:gap-6 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 md:px-4 py-2 text-sm md:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-b-2 ${tab === activeTab
                                ? 'border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {renderTabContent()}

            {studentData && (
                <UpdateStudentModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    currentStudent={studentData}
                    onUpdateStudent={handleUpdateStudent}
                />
            )}
        </div>
    );
};

export default StudentDetail;