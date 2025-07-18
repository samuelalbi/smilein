import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getInstructor,
    updateInstructor,
    getNextInstructor,
    getInstructorProfilePicture
} from '../../api/instructorApi';
import { InstructorRead, InstructorUpdate } from '../../types/instructor';
import About from '../../components/Instructor/About';
import InstructorCourses from '../../components/Instructor/InstructorCourses';
import UpdateInstructorModal from '../../components/Instructor/UpdateInstructorModal';
import axios from 'axios';
import Swal from 'sweetalert2';

const InstructorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [instructorData, setInstructorData] = useState<InstructorRead | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('About');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    // Removed "Assignment" from tabs array
    const tabs: string[] = [
        'About',
        'Courses'
    ];

    useEffect(() => {
        const fetchInstructorDetails = async () => {
            try {
                if (id) {
                    const instructor = await getInstructor(parseInt(id, 10));
                    setInstructorData(instructor);

                    // Fetch profile picture
                    try {
                        const pictureData = await getInstructorProfilePicture(parseInt(id, 10));
                        if (pictureData && pictureData.profile_picture_url) {
                            setProfilePicture(formatImageUrl(pictureData.profile_picture_url));
                        }
                    } catch (err) {
                        console.log('No profile picture found, using initials');
                        // We'll use initials as fallback, so no need to set error
                    }
                }
            } catch (err) {
                console.error('Failed to fetch instructor details', err);
                setError('Failed to load instructor details');
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorDetails();
    }, [id]);

    // Helper function to format image URL
    const formatImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('/')) return `https://web-production-b963.up.railway.app${url}`;
        return url;
    };

    const handleNextInstructor = async () => {
        if (loading || isNavigating || !instructorData?.instructor_id) return;

        try {
            setIsNavigating(true);

            const nextInstructor = await getNextInstructor(instructorData.instructor_id);

            navigate(`/instructor/instructor-list/${nextInstructor.instructor_id}`);

            if (nextInstructor.instructor_id === instructorData.instructor_id) {
                Swal.fire({
                    title: 'Info',
                    text: 'Hanya ada satu instructor dalam database',
                    icon: 'info',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (err) {
            console.error('Failed to navigate to next instructor', err);

            Swal.fire({
                title: 'Error!',
                text: 'Gagal mendapatkan data instructor berikutnya',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsNavigating(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'About':
                return <About instructorData={instructorData} />;
            case 'Courses':
                return <InstructorCourses instructorData={instructorData} />;
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

    const handleUpdateInstructor = async (instructorId: number, updateData: InstructorUpdate) => {
        try {
            // Validate data before sending
            const validatedData = validateInstructorUpdate(updateData);

            // For API calls, if your backend requires all fields, merge with current data
            const updatedInstructor = await updateInstructor(instructorId, validatedData);
            setInstructorData(updatedInstructor);
            setIsUpdateModalOpen(false);

            // Show SweetAlert2 success notification
            Swal.fire({
                title: 'Success!',
                text: 'Instructor data has been updated successfully',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const errorDetails = error.response?.data;
                console.error('Validation Errors:', errorDetails);

                // Translate server errors to user-friendly messages
                const errorMessages = errorDetails?.detail?.map((err: any) =>
                    `Missing or invalid ${err.loc[1] || 'field'}`
                ).join(', ');

                // Show SweetAlert2 error notification
                Swal.fire({
                    title: 'Error!',
                    text: errorMessages || 'Failed to update instructor',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            } else {
                console.error('Unexpected error:', error);

                // Show SweetAlert2 error notification
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'An unexpected error occurred',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            }
        }
    };

    // Validation helper function
    function validateInstructorUpdate(data: InstructorUpdate): InstructorUpdate {
        console.log(data);

        // Don't require all fields to be present for updates
        // Just check that any fields that are provided have valid values

        // Make sure we have at least one field to update
        if (Object.keys(data).length === 0) {
            throw new Error('No update data provided');
        }

        // Only validate fields that are present
        if (data.email && !data.email.includes('@')) {
            throw new Error('Invalid email format');
        }

        if (data.phone_number && data.phone_number.length < 10) {
            throw new Error('Phone number should be at least 10 digits');
        }

        return data;
    }

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
                            alt={`${instructorData?.full_name} profile`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl md:text-2xl text-white">
                            {getInitials(instructorData?.full_name)}
                        </span>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold dark:text-white truncate">{instructorData?.full_name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{instructorData?.email || 'instructor@gmail.com'}</p>
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
                                onClick={handleNextInstructor}
                                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={loading || isNavigating}
                            >
                                {isNavigating ? (
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.207a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400 truncate">{instructorData?.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">{instructorData?.phone_number}</span>
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

            {instructorData && (
                <UpdateInstructorModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    currentInstructor={instructorData}
                    onUpdateInstructor={handleUpdateInstructor}
                />
            )}
        </div>
    );
}

export default InstructorDetail;