import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructors, deleteInstructor, getInstructorProfilePicture } from '../../api/instructorApi';
import Swal from 'sweetalert2';
import ProfileCard from '../../components/List/List';
import AddInstructorModal from '../../components/Instructor/AddInstructorModal';
import { InstructorRead } from '../../types/instructor';

// Interface for instructor with profile picture
interface InstructorWithPicture extends InstructorRead {
    profilePicture?: string | null;
}

const InstructorList = () => {
    const [instructors, setInstructors] = useState<InstructorWithPicture[]>([]);
    const [filteredInstructors, setFilteredInstructors] = useState<InstructorWithPicture[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter] = useState<string>('all');

    useEffect(() => {
        loadInstructors();
    }, []);

    useEffect(() => {
        // Apply filters whenever instructors, searchTerm, or statusFilter changes
        applyFilters();
    }, [instructors, searchTerm, statusFilter]);

    const loadInstructors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getInstructors();

            // Fetch profile pictures for all instructors
            const instructorsWithPictures = await Promise.all(
                data.map(async (instructor: { instructor_id: number; }) => {
                    try {
                        const pictureData = await getInstructorProfilePicture(instructor.instructor_id);
                        return {
                            ...instructor,
                            profilePicture: pictureData?.profile_picture_url ? formatImageUrl(pictureData.profile_picture_url) : null
                        };
                    } catch (error) {
                        console.log(`No profile picture for instructor ${instructor.instructor_id}`);
                        return {
                            ...instructor,
                            profilePicture: null
                        };
                    }
                })
            );

            setInstructors(instructorsWithPictures);
            setFilteredInstructors(instructorsWithPictures);
        } catch (err) {
            setError('Failed to load instructors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format image URL
    const formatImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('/')) return `https://web-production-b963.up.railway.app${url}`;
        return url;
    };

    const applyFilters = () => {
        let result = [...instructors];

        // Apply search filter (search by NIDN)
        if (searchTerm.trim() !== '') {
            result = result.filter(instructor =>
                instructor.nidn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instructor.full_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter(instructor => instructor.is_active === isActive);
        }

        setFilteredInstructors(result);
    };

    const handleDelete = async (instructorId: number) => {
        const result = await Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Anda tidak dapat mengembalikan ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await deleteInstructor(instructorId);
                await Swal.fire({
                    title: 'Terhapus!',
                    text: 'Data instruktur telah terhapus.',
                    icon: 'success',
                    confirmButtonColor: '#4CAF50'
                });
                loadInstructors();
            } catch (err) {
                setError('Gagal menghapus data instruktur');
                console.error(err);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Gagal menghapus data instruktur.',
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        }
    };

    const getStatusText = (isActive: boolean): 'Active' | 'Inactive' => {
        return isActive ? 'Active' : 'Inactive';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500 dark:text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-8 p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instruktur</h2>
                <div className="flex items-center space-x-2">
                    {/* Search Input with Icon */}
                    <div className="relative w-48 md:w-60">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by NIDN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 pl-10 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                   

                    {/* Add Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700"

                    >
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Instructor
                    </button>
                </div>
            </div>

            {/* Add Instructor Modal */}
            <AddInstructorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadInstructors}
            />

            {filteredInstructors.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No instructors found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInstructors.map((instructor) => (
                        <EnhancedProfileCard
                            key={instructor.instructor_id}
                            id={instructor.instructor_id}
                            name={instructor.full_name}
                            email={instructor.email}
                            description={
                                <>
                                    <span className="font-medium">NIDN:</span> {instructor.nidn}
                                </>
                            }
                            status={getStatusText(instructor.is_active)}
                            onDelete={() => handleDelete(instructor.instructor_id)}
                            type='instructor'
                            profilePicture={instructor.profilePicture}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Enhanced Profile Card component with profile picture support
interface EnhancedProfileCardProps extends Omit<React.ComponentProps<typeof ProfileCard>, 'profilePicture'> {
    profilePicture?: string | null;
}

const EnhancedProfileCard: React.FC<EnhancedProfileCardProps> = ({
    id,
    name,
    email,
    description,
    onDelete,
    type,
    profilePicture
}) => {
    const navigate = useNavigate();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const handleClick = () => {
        // Dynamic navigation based on the type prop
        const route = type === 'student'
            ? `/student/student-list/${id}`
            : `/instructor/instructor-list/${id}`;

        navigate(route, {
            state: {
                [`${type}Id`]: id  // Dynamically set studentId or instructorId
            }
        });
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 flex items-start space-x-4 transition-colors duration-200 cursor-pointer hover:shadow-lg"
        >
            {profilePicture ? (
                <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                        src={profilePicture}
                        alt={`${name} profile`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-600">
                    {getInitials(name)}
                </div>
            )}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </div>
                    </div>
                    {onDelete && (
                        <button
                            onClick={handleDeleteClick}
                            className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorList;