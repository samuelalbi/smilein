import React, { useEffect, useState } from 'react';
import CardDataStats from '../../components/CardDataStats';
import AttendanceChart from '../../components/Charts/ChartOne';
import TableOne from '../../components/Tables/TableOne';
import { getStudents } from '../../api/studentApi';
import { getInstructors } from '../../api/instructorApi';
import { getCourses } from '../../api/courseApi';
import { getSchedules } from '../../api/scheduleApi';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/SkeletonLoading';
import { jwtDecode } from 'jwt-decode';
import { ScheduleRead } from '../../types/schedule';

// Define the token structure
interface DecodedToken {
  user_id: number;
  user_type: string; // To check if user is admin
  // Add other properties from your token if needed
}

const Dashboard: React.FC = () => {
  // State for storing counts
  const [studentCount, setStudentCount] = useState<number>(0);
  const [instructorCount, setInstructorCount] = useState<number>(0);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [todayScheduleCount, setTodayScheduleCount] = useState<number>(0); // Changed name to be more descriptive
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add state to track if user is admin

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to filter schedules for today
  const filterTodaySchedules = (schedules: ScheduleRead[]): ScheduleRead[] => {
    const todayDate = getTodayDate();
    return schedules.filter(schedule => {
      // Extract date part from schedule_date (in case it includes time)
      const scheduleDate = schedule.schedule_date.split('T')[0]; // This handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
      return scheduleDate === todayDate;
    });
  };

  useEffect(() => {
    // Check user role from token when component mounts
    const checkUserRole = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);

          // Check if user is admin
          const userIsAdmin = decoded.user_type === 'admin';
          setIsAdmin(userIsAdmin);
        }
        catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem('token');
        }
      } else {
        console.log("Token tidak ditemukan di localStorage");
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    // Only fetch data if user is admin
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false); // Set loading to false for instructors to avoid showing skeletons indefinitely
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [students, instructors, courses, allSchedules] = await Promise.all([
        getStudents(0),
        getInstructors(0),
        getCourses(0),
        getSchedules(0) // Get all schedules first
      ]);

      // Filter schedules for today only
      const todaySchedules = filterTodaySchedules(allSchedules);

      setStudentCount(students.length);
      setInstructorCount(instructors.length);
      setCourseCount(courses.length);
      setTodayScheduleCount(todaySchedules.length); // Set count for today's schedules only

      console.log(`Total schedules: ${allSchedules.length}, Today's schedules: ${todaySchedules.length}`);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error message if API calls fail */}
      {error && (
        <div className="mb-4 rounded-sm border border-danger bg-danger p-4 text-white">
          {error}
        </div>
      )}

      {/* Welcome message for instructors */}
      {!isAdmin && (
        <div className="mb-6 p-6 bg-white dark:bg-boxdark rounded-sm shadow-default">
          <h2 className="text-xl font-bold mb-2">Selamat Datang di Dashboard Dosen</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Gunakan menu di samping untuk mengakses fitur-fitur yang tersedia untuk Anda.
          </p>
        </div>
      )}

      {/* Stats Cards - Only visible for admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 w-full">
          {loading ? (
            // Skeleton loading for cards
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              {/* Card Total Mahasiswa */}
              <CardDataStats
                title="Total Mahasiswa"
                total={studentCount.toLocaleString()}
                levelUp
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users fill-primary dark:fill-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </CardDataStats>

              {/* Card Total Dosen */}
              <CardDataStats
                title="Total Dosen"
                total={instructorCount.toLocaleString()}
                levelUp
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 794.082 794.082" fill="white" className='fill-primary dark:fill-white'>
                  <g>
                    <path d="M713.298,186.754h0.003c0,90.051,0,179.204,0,269.796c-119.669,0.52-237.33,0.62-357.021,0.442c0-44.206,0-85.371,0-127.49c-17.63,0-33.229,0-52.015,0c0,44.361-1.585,86.458,0.541,128.362c1.495,29.475,29.195,51.681,59.068,51.744c114.688,0.25,229.375,0.143,344.062,0.619c34.097,0.146,60.201-24.021,60.039-60.542c-0.386-87.645-0.106-175.291-0.096-262.936h0.096v-45.693h-54.678L713.298,186.754L713.298,186.754z" />
                    <path d="M775.44,72.811c-5.709-1.829-12.212-1.547-18.359-1.557c-57.313-0.103-114.627-0.062-171.938-0.062c-4.248,0-8.469,0-12.485,0c-1.768-18.784-17.569-33.482-36.814-33.482s-35.052,14.699-36.817,33.482c-4.446,0-9.112,0-13.8,0c-55.239,0-110.48-0.002-165.728,0.004c-4.833,0.001-9.71-0.352-14.491,0.173c-14.131,1.546-26.798,14.699-26.558,27.161c0.239,12.377,13.224,25.016,27.354,26.417c3.421,0.34,6.902,0.102,10.354,0.102c147.084,0.003,294.167,0.003,441.25,0.001c3.455,0,6.929,0.237,10.354-0.082c13.365-1.242,25.063-12.418,26.25-24.873C794.962,90.027,786.329,76.301,775.44,72.811z" />
                    <path d="M358.014,201.16v-60.099h-54.678v60.099h2.078c17.43,0,33.452,0,50.521,0H358.014z" />
                    <g>
                      <circle cx="149.113" cy="113.355" r="89.043" />
                      <path d="M439.494,215.397H211.476l-11.131,69.235l-10.105,62.865h-13.219l-8.515-96.739l9.972-35.357h-58.729l9.972,35.357l-8.515,96.739h-13.219L100,297.809l-10.042-62.466l-3.207-19.945H50h-0.125v0.003C22.317,215.468,0,237.825,0,265.398v212.99c0,27.612,22.386,50,50,50v187.548c0,27.614,22.386,50,50,50c24.416,0,44.731-17.505,49.112-40.646c4.382,23.142,24.699,40.646,49.115,40.646c27.614,0,50-22.386,50-50V503.403V414.59V315.4h191.269c27.613,0,50-22.387,50-50C489.494,237.783,467.109,215.397,439.494,215.397z" />
                    </g>
                    <path d="M683.544,718.137l0.038-0.039L563.957,598.473v-69.024h-56.055v64.062v4.963L388.278,718.098l0.038,0.039c-10.936,10.935-10.936,28.663,0,39.598c10.936,10.937,28.663,10.936,39.599,0l79.988-79.988v64.023c0,15.464,12.534,28,28,28c15.464,0,28-12.536,28-28h0.055v-64.023l79.988,79.988c10.936,10.936,28.663,10.937,39.599,0C694.479,746.8,694.479,729.072,683.544,718.137z" />
                  </g>
                </svg>
              </CardDataStats>

              {/* Card Total Course */}
              <CardDataStats
                title="Total Mata Kuliah"
                total={courseCount.toLocaleString()}
                levelUp
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notebook-pen fill-primary dark:fill-white"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" /><path d="M2 6h4" /><path d="M2 10h4" /><path d="M2 14h4" /><path d="M2 18h4" /><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" /></svg>
              </CardDataStats>

              {/* Card Total Schedule for Today */}
              <CardDataStats
                title="Jadwal Hari Ini"
                total={todayScheduleCount.toLocaleString()}
                levelDown
              >
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.7024 0.586486H18.1681V2.09086C18.1681 2.59172 17.7506 3.00086 17.2592 3.00086C16.7678 3.00086 16.3592 2.59172 16.3592 2.09086V0.586486H5.6408V2.09086C5.6408 2.59172 5.23223 3.00086 4.7408 3.00086C4.24937 3.00086 3.8408 2.59172 3.8408 2.09086V0.586486H2.2976C1.31509 0.586486 0.5 1.39371 0.5 2.38741V19.6135C0.5 20.6072 1.31509 21.4144 2.2976 21.4144H19.7024C20.6849 21.4144 21.5 20.6072 21.5 19.6135V2.38741C21.5 1.39371 20.6849 0.586486 19.7024 0.586486ZM19.7024 19.6135H2.2976V6.30971H19.7024V19.6135Z"
                    fill=""
                  />
                  <path
                    d="M6.5 11H5.1C4.8 11 4.5 10.7 4.5 10.4V9.6C4.5 9.3 4.8 9 5.1 9H6.5C6.8 9 7.1 9.3 7.1 9.6V10.4C7.1 10.7 6.8 11 6.5 11Z"
                    fill=""
                  />
                  <path
                    d="M11.9 11H10.5C10.2 11 9.90002 10.7 9.90002 10.4V9.6C9.90002 9.3 10.2 9 10.5 9H11.9C12.2 9 12.5 9.3 12.5 9.6V10.4C12.5 10.7 12.2 11 11.9 11Z"
                    fill=""
                  />
                  <path
                    d="M17.3 11H15.9C15.6 11 15.3 10.7 15.3 10.4V9.6C15.3 9.3 15.6 9 15.9 9H17.3C17.6 9 17.9 9.3 17.9 9.6V10.4C17.9 10.7 17.6 11 17.3 11Z"
                    fill=""
                  />
                  <path
                    d="M6.5 16H5.1C4.8 16 4.5 15.7 4.5 15.4V14.6C4.5 14.3 4.8 14 5.1 14H6.5C6.8 14 7.1 14.3 7.1 14.6V15.4C7.1 15.7 6.8 16 6.5 16Z"
                    fill=""
                  />
                  <path
                    d="M11.9 16H10.5C10.2 16 9.90002 15.7 9.90002 15.4V14.6C9.90002 14.3 10.2 14 10.5 14H11.9C12.2 14 12.5 14.3 12.5 14.6V15.4C12.5 15.7 12.2 16 11.9 16Z"
                    fill=""
                  />
                  <path
                    d="M17.3 16H15.9C15.6 16 15.3 15.7 15.3 15.4V14.6C15.3 14.3 15.6 14 15.9 14H17.3C17.6 14 17.9 14.3 17.9 14.6V15.4C17.9 15.7 17.6 16 17.3 16Z"
                    fill=""
                  />
                </svg>
              </CardDataStats>
            </>
          )}
        </div>
      )}

      {/* Full-width Chart - Only visible for admin */}
      {isAdmin && (
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <div className="col-span-12">
            {loading ? <ChartSkeleton /> : <AttendanceChart />}
          </div>
        </div>
      )}

      {/* Table - Full Width - Visible for both admin and instructor */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12">
          {loading ? <TableSkeleton /> : <TableOne />}
        </div>
      </div>
    </>
  );
};

export default Dashboard;