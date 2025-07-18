import React, { useState, useEffect, useMemo } from 'react';
import { getAttendances } from '../../api/attendanceApi';
import { getInstructorCourse } from '../../api/instructorCourseApi';
import { AttendanceWithScheduleRead } from '../../types/attendance';
import { jwtDecode } from 'jwt-decode';

// Define the token structure
interface DecodedToken {
  user_id: number;
  user_type: string;
}

// Define instructor course structure
interface InstructorCourse {
  instructor_id: number;
  course_id: number;
  instructor_course_id: number;
  course: {
    course_id: number;
    course_name: string;
    sks: number;
  };
}

interface CourseAttendance {
  code: string;
  name: string;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
}

const TableOne: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceWithScheduleRead[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Get instructor ID from token
  useEffect(() => {
    const fetchInstructorId = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          setInstructorId(decoded.user_id);

          // Check if user is admin
          const userIsAdmin = decoded.user_type === 'admin';
          setIsAdmin(userIsAdmin);

          // Only fetch instructor courses if not admin
          if (!userIsAdmin) {
            try {
              const courses = await getInstructorCourse(decoded.user_id);
              setInstructorCourses(Array.isArray(courses) ? courses : [courses]);
            } catch (error) {
              console.error('Failed to fetch instructor courses:', error);
              setInstructorCourses([]);
            }
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem('token');
        }
      }
    };

    fetchInstructorId();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAttendances(0, 1000); // Get a large batch of attendance records
        setAttendanceData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Gagal memuat data kehadiran. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    // Only fetch data once we have the instructor ID
    if (instructorId !== null) {
      fetchData();
    }
  }, [instructorId]);

  // Process attendance data to get course statistics
  const courseAttendanceStats = useMemo(() => {
    // Create a set of course IDs taught by this instructor
    const instructorCourseIds = new Set(
      instructorCourses.map(course => course.course_id)
    );

    // Create a map to group attendance by course
    const courseMap = new Map<string, {
      code: string;
      name: string;
      records: AttendanceWithScheduleRead[];
    }>();

    // Filter to only include courses taught by this instructor (unless admin)
    attendanceData.forEach(record => {
      if (!record.schedule?.course) return;

      const courseId = record.schedule.course.course_id;

      // Skip if not admin and not instructor's course
      if (!isAdmin && !instructorCourseIds.has(courseId)) {
        return;
      }

      // Convert course_id to string to use as map key
      const courseCode = courseId ? courseId.toString() : 'UNKNOWN';
      const courseName = record.schedule.course.course_name || 'Unknown Course';

      if (!courseMap.has(courseCode)) {
        courseMap.set(courseCode, {
          code: courseCode,
          name: courseName,
          records: []
        });
      }

      courseMap.get(courseCode)?.records.push(record);
    });

    // Calculate statistics for each course
    const stats: CourseAttendance[] = [];

    courseMap.forEach((course, code) => {
      const records = course.records;
      const uniqueStudentIds = new Set(records.map(r => r.student_id));
      const totalStudents = uniqueStudentIds.size;

      // Count statuses
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;

      records.forEach(record => {
        const status = record.status?.toUpperCase();
        if (status === 'PRESENT') presentCount++;
        else if (status === 'LATE') lateCount++;
        else if (status === 'ABSENT') absentCount++;
      });

      // Calculate attendance percentage (present + late are considered attended)
      const attendedCount = presentCount + lateCount;
      const totalRecords = presentCount + lateCount + absentCount;
      const attendancePercentage = totalRecords > 0
        ? (attendedCount / totalRecords) * 100
        : 0;

      stats.push({
        code,
        name: course.name,
        totalStudents,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage
      });
    });

    // Sort by attendance percentage (highest to lowest)
    return stats.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  }, [attendanceData, instructorCourses, isAdmin]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = courseAttendanceStats.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(courseAttendanceStats.length / itemsPerPage));

  // Handle pagination navigation
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center text-meta-1">{error}</div>
      </div>
    );
  }

  if (courseAttendanceStats.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="text-center dark:text-white">
          {isAdmin
            ? "Tidak ada data kehadiran tersedia."
            : "Anda belum memiliki data kehadiran untuk mata kuliah yang Anda ajar."}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 h-full flex flex-col">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        {isAdmin ? "Kehadiran Mata Kuliah (Semua)" : "Kehadiran Mata Kuliah Anda"}
      </h4>

      <div className="flex flex-col flex-grow">
        <div className="grid grid-cols-6 rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Kode
            </h5>
          </div>
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Mata Kuliah
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Mahasiswa
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Hadir/Terlambat/Absen
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Kehadiran
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Persentase
            </h5>
          </div>
        </div>

        <div className="flex-grow">
          {currentItems.map((course, key) => {
            const totalCount = course.presentCount + course.lateCount + course.absentCount;

            return (
              <div
                className={`grid grid-cols-6 ${key === currentItems.length - 1
                  ? ''
                  : 'border-b border-stroke dark:border-strokedark'
                  }`}
                key={key}
              >
                <div className="flex items-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">
                    {course.code}
                  </p>
                </div>

                <div className="flex items-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">{course.name}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">{course.totalStudents}</p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">
                    <span className="text-meta-3">{course.presentCount}</span>
                    /
                    <span className="text-meta-5">{course.lateCount}</span>
                    /
                    <span className="text-meta-1">{course.absentCount}</span>
                  </p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className="text-black dark:text-white">
                    {course.presentCount + course.lateCount}/{totalCount}
                  </p>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <p className={`${course.attendancePercentage >= 90
                    ? 'text-meta-3'
                    : course.attendancePercentage >= 80
                      ? 'text-meta-5'
                      : 'text-meta-1'
                    }`}>
                    {course.attendancePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {courseAttendanceStats.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, courseAttendanceStats.length)} dari {courseAttendanceStats.length} mata kuliah
          </div>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-opacity-90'
                }`}
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 bg-gray-100 dark:bg-meta-4 rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-opacity-90'
                }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOne;