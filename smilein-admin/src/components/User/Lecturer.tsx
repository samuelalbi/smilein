import React, { useState } from 'react';

interface Course {
    id: number;
    code: string;
    name: string;
    credits: number;
    attendance: number;
}

const Lectures: React.FC = () => {
    const [academicYear, setAcademicYear] = useState<string>("2024/2025");
    const [semester, setSemester] = useState<string>("Gasal");

    // Sample data - in real app this would come from an API
    const courses: Course[] = [
        {
            id: 1,
            code: "4233101",
            name: "Magang",
            credits: 20,
            attendance: 0
        }
    ];

    return (
        <div className="mt-6 p-4 md:p-6 border dark:border-gray-700 rounded-lg dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Lectures Information</h2>
            <div className="mb-6">
                <label className="text-sm text-gray-500 dark:text-gray-400">Academic Year</label>
                <div className="mt-2 flex gap-4">
                    <select
                        className="p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                    >
                        <option>2024/2025</option>
                        <option>2023/2024</option>
                    </select>
                    <select
                        className="p-2 border rounded dark:bg-gray-700 dark:text-gray-300"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    >
                        <option>Gasal</option>
                        <option>Genap</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Search
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">#</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Course Code</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Course</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Credit (SKS)</th>
                            <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Attendance (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{course.id}</td>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{course.code}</td>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{course.name}</td>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{course.credits}</td>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{course.attendance.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Lectures;