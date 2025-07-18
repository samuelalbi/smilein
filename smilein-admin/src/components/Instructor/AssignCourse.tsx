import React, { useState, useEffect } from 'react';
import { InstructorRead } from '../../types/instructor';
import {
    createInstructorCourse,
} from '../../api/instructorCourseApi';
import { getInstructors } from '../../api/instructorApi';
import { getCourses } from '../../api/courseApi'; // Make sure to use getCourses
import { Course } from '../../types/course'; // Import Course type
import Swal from 'sweetalert2';

const InstructorAssignment: React.FC = () => {
    const [instructors, setInstructors] = useState<InstructorRead[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedInstructor, setSelectedInstructor] = useState<number | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [recentAssignments, setRecentAssignments] = useState<{
        instructorName: string;
        courseName: string;
        date: string;
    }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data in parallel
                const instructorsPromise = getInstructors();
                const coursesPromise = getCourses(); // Using getCourses from courseApi

                // Wait for both to complete
                const [instructorsData, coursesData] = await Promise.all([
                    instructorsPromise,
                    coursesPromise
                ]);

                console.log("Instructors data:", instructorsData);
                console.log("Courses data:", coursesData);

                // Check that we have valid data before setting state
                if (Array.isArray(instructorsData)) {
                    setInstructors(instructorsData);
                } else {
                    console.error("Invalid instructors data:", instructorsData);
                }

                if (Array.isArray(coursesData)) {
                    setCourses(coursesData);
                } else {
                    console.error("Invalid courses data:", coursesData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Gagal memuat data',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssignCourse = async () => {
        if (!selectedInstructor || !selectedCourse) {
            Swal.fire({
                title: 'Warning!',
                text: 'Pilih instructor dan course terlebih dahulu',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            // Create API payload
            const payload = {
                instructor_id: selectedInstructor,
                course_id: selectedCourse
            };

            // Call API to create assignment
            const newAssignment = await createInstructorCourse(payload);
            console.log("New assignment created:", newAssignment);

            // Get instructor and course names for display
            const instructor = instructors.find(i => i.instructor_id === selectedInstructor);
            const course = courses.find(c => c.course_id === selectedCourse);

            if (instructor && course) {
                // Add to recent assignments list
                setRecentAssignments([
                    {
                        instructorName: instructor.full_name || 'Unknown Instructor',
                        courseName: course.course_name || 'Unknown Course',
                        date: new Date().toLocaleString()
                    },
                    ...recentAssignments.slice(0, 9) // Keep only 10 most recent
                ]);
            }

            // Reset selections
            setSelectedInstructor(null);
            setSelectedCourse(null);

            // Show success notification
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
            console.error('Error assigning course:', error);

            Swal.fire({
                title: 'Error!',
                text: error.message || 'Gagal assign course ke instructor',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
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
            <h2 className="text-lg font-semibold mb-6 dark:text-white">Assign Courses to Instructors</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignment Form */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="text-md font-medium mb-4 dark:text-white">Create New Assignment</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Instructor
                        </label>
                        <select
                            value={selectedInstructor || ""}
                            onChange={(e) => setSelectedInstructor(e.target.value ? parseInt(e.target.value, 10) : null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select an instructor</option>
                            {instructors && instructors.length > 0 ? (
                                instructors.map(instructor => (
                                    <option key={instructor.instructor_id} value={instructor.instructor_id}>
                                        {instructor.full_name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No instructors available</option>
                            )}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Course
                        </label>
                        <select
                            value={selectedCourse || ""}
                            onChange={(e) => setSelectedCourse(e.target.value ? parseInt(e.target.value, 10) : null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select a course</option>
                            {courses && courses.length > 0 ? (
                                courses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No courses available</option>
                            )}
                        </select>
                    </div>

                    <button
                        onClick={handleAssignCourse}
                        className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                        Assign Course
                    </button>
                </div>

                {/* Recent Assignments */}
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="text-md font-medium mb-4 dark:text-white">Recent Assignments</h3>

                    {recentAssignments.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p>No recent assignments</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentAssignments.map((assignment, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex justify-between">
                                        <span className="font-medium dark:text-white">{assignment.instructorName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{assignment.date}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        Assigned to: {assignment.courseName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorAssignment;