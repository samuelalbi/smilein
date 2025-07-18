import React, { useState, useEffect } from 'react';
import { InstructorRead } from '../../types/instructor';
import {
    getInstructorCoursesByInstructorId,
    createInstructorCourse,
    updateInstructorCourse,
    deleteInstructorCourse,
} from '../../api/instructorCourseApi';
import { getCourses } from '../../api/courseApi'; // Import from courseApi instead
import { Course } from '../../types/course'; // Import from types directory
import { InstructorCourseRead, InstructorCourseCreate, InstructorCourseUpdate } from '../../types/instructorCourse';
import Swal from 'sweetalert2';

interface InstructorCoursesProps {
    instructorData: InstructorRead | null;
}

const InstructorCourses: React.FC<InstructorCoursesProps> = ({ instructorData }) => {
    const [instructorCourses, setInstructorCourses] = useState<InstructorCourseRead[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedCourse, setSelectedCourse] = useState<InstructorCourseRead | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!instructorData?.instructor_id) {
                setLoading(false);
                return;
            }

            try {
                // First get all available courses
                const allCourses = await getCourses();
                setAvailableCourses(allCourses);
                console.log("Available courses:", allCourses);

                // Then get instructor course assignments
                const instructorCoursesData = await getInstructorCoursesByInstructorId(instructorData.instructor_id);
                console.log("Raw instructor courses:", instructorCoursesData);

                // Enhance the data with course information
                const enhancedInstructorCourses = instructorCoursesData.map(assignment => {
                    // For each assignment, find the corresponding course from allCourses
                    const courseInfo = allCourses.find(course => course.course_id === assignment.course_id);

                    // Create a new object with merged data
                    return {
                        ...assignment,
                        // Keep track of course name in a separate property if needed
                        courseName: courseInfo?.course_name || `Course #${assignment.course_id}`
                    };
                });

                console.log("Enhanced instructor courses:", enhancedInstructorCourses);
                setInstructorCourses(enhancedInstructorCourses);
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Gagal memuat data course',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [instructorData]);

    const handleAddCourse = async (courseId: number) => {
        if (!instructorData?.instructor_id) {
            Swal.fire({
                title: 'Error!',
                text: 'Data instructor tidak valid',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            // Create API payload
            const payload: InstructorCourseCreate = {
                instructor_id: instructorData.instructor_id,
                course_id: courseId
            };

            // Call API to create assignment
            const newAssignment = await createInstructorCourse(payload);
            console.log("New assignment created:", newAssignment);

            // Update local state with refreshed data
            const refreshedCourses = await getInstructorCoursesByInstructorId(instructorData.instructor_id);
            setInstructorCourses(refreshedCourses);

            setIsAddModalOpen(false);

            Swal.fire({
                title: 'Success!',
                text: 'Course berhasil di-assign ke instructor',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error: any) {
            console.error('Error adding course:', error);

            Swal.fire({
                title: 'Error!',
                text: error.message || 'Gagal assign course ke instructor',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    };

    const handleEditCourse = async (courseId: number) => {
        if (!selectedCourse) {
            Swal.fire({
                title: 'Error!',
                text: 'Data assignment tidak ditemukan',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            // Call API to update assignment
            const updateData: InstructorCourseUpdate = {
                course_id: courseId
            };

            await updateInstructorCourse(
                selectedCourse.instructor_course_id,
                updateData
            );

            // Refresh data from server instead of updating locally
            const refreshedCourses = await getInstructorCoursesByInstructorId(instructorData!.instructor_id);
            setInstructorCourses(refreshedCourses);

            setIsEditModalOpen(false);
            setSelectedCourse(null);

            Swal.fire({
                title: 'Success!',
                text: 'Assignment berhasil diperbarui',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error: any) {
            console.error('Error updating course assignment:', error);

            Swal.fire({
                title: 'Error!',
                text: error.message || 'Gagal memperbarui assignment',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    };

    const handleDeleteCourse = (instructorCourseId: number) => {
        Swal.fire({
            title: 'Konfirmasi',
            text: 'Apakah Anda yakin ingin menghapus assignment ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Call API to delete assignment
                    await deleteInstructorCourse(instructorCourseId);

                    // Refresh data from server
                    if (instructorData?.instructor_id) {
                        const refreshedCourses = await getInstructorCoursesByInstructorId(instructorData.instructor_id);
                        setInstructorCourses(refreshedCourses);
                    } else {
                        // Fallback to local update if we can't refresh
                        const filteredCourses = instructorCourses.filter(
                            course => course.instructor_course_id !== instructorCourseId
                        );
                        setInstructorCourses(filteredCourses);
                    }

                    Swal.fire({
                        title: 'Terhapus!',
                        text: 'Assignment berhasil dihapus',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6',
                        timer: 3000,
                        timerProgressBar: true
                    });
                } catch (error: any) {
                    console.error('Error deleting course assignment:', error);

                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'Gagal menghapus assignment',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d33'
                    });
                }
            }
        });
    };

    // Filter available courses that haven't been assigned yet
    const getUnassignedCourses = () => {
        return availableCourses.filter(course =>
            !instructorCourses.some(ic => ic.course_id === course.course_id)
        );
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            return dateString;
        }
    };

    // Handle multiple ways to get course name based on data structure
    // Then update the getCourseName function:
    const getCourseName = (course: InstructorCourseRead): string => {
        // First check if we added the courseName property in our enhancement
        if ('courseName' in course) {
            return (course as any).courseName;
        }

        // If course object exists and has a course name
        if (course.course && course.course.course_name) {
            return course.course.course_name;
        }

        // Look in the availableCourses array using course_id
        const matchingCourse = availableCourses.find(c => c.course_id === course.course_id);
        if (matchingCourse) {
            return matchingCourse.course_name;
        }

        // Last resort fallback
        return `Course #${course.course_id}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="mt-6 p-4 md:p-6 border dark:border-gray-700 rounded-lg dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold dark:text-white">Assigned Courses</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Assign New Course
                </button>
            </div>

            {instructorCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Belum ada course yang di-assign ke instructor ini</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    No
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Course ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Course Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Assigned Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {instructorCourses.map((course, index) => (
                                <tr key={course.instructor_course_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {course.course_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {getCourseName(course)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {course.assigned_date ? formatDate(course.assigned_date) : formatDate(course.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.instructor_course_id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Course Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Assign New Course</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Course
                            </label>
                            <select
                                id="courseSelect"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a course</option>
                                {getUnassignedCourses().length > 0 ? (
                                    getUnassignedCourses().map(course => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No courses available</option>
                                )}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const selectElement = document.getElementById('courseSelect') as HTMLSelectElement;
                                    if (selectElement.value) {
                                        handleAddCourse(parseInt(selectElement.value, 10));
                                    } else {
                                        Swal.fire({
                                            title: 'Warning!',
                                            text: 'Pilih course terlebih dahulu',
                                            icon: 'warning',
                                            confirmButtonText: 'OK',
                                            confirmButtonColor: '#3085d6'
                                        });
                                    }
                                }}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {isEditModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit Course Assignment</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Course
                            </label>
                            <input
                                type="text"
                                value={getCourseName(selectedCourse)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Course
                            </label>
                            <select
                                id="editCourseSelect"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                defaultValue=""
                            >
                                <option value="" disabled>Select a course</option>
                                {availableCourses
                                    .filter(course => course.course_id !== selectedCourse.course_id)
                                    .map(course => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedCourse(null);
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const selectElement = document.getElementById('editCourseSelect') as HTMLSelectElement;
                                    if (selectElement.value) {
                                        handleEditCourse(parseInt(selectElement.value, 10));
                                    } else {
                                        Swal.fire({
                                            title: 'Warning!',
                                            text: 'Pilih course terlebih dahulu',
                                            icon: 'warning',
                                            confirmButtonText: 'OK',
                                            confirmButtonColor: '#3085d6'
                                        });
                                    }
                                }}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCourses;