import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import Dashboard from './pages/Dashboard/ECommerce';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DefaultLayout from './layout/DefaultLayout';
import StudentList from './pages/User/StudentList';
import AttendanceHistory from './pages/Attendance/Attendances';
import 'sweetalert2/dist/sweetalert2.css';
import StudentDetail from './pages/User/StudentDetail';
import CourseList from './pages/Academic/CourseList';
import Schedules from './pages/Schedule/Schedules';
import InstructorList from './pages/Instructor/InstructorList';
import InstructorDetail from './pages/Instructor/InstructorDetail';
import Swal from 'sweetalert2';
import Room from './pages/Room/Rooms';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [_, setIsAuthenticated] = useState<boolean>(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      if (decodedPayload.exp) {
        const expirationTime = decodedPayload.exp * 1000;
        return Date.now() >= expirationTime;
      }
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && isTokenExpired() && pathname !== '/auth/signin') {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please sign in again.',
        confirmButtonText: 'Sign In',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
      }).then(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/auth/signin', { replace: true });
      });
    }
  }, [pathname, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleSignIn = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const aktif = !!localStorage.getItem('token');

  return loading ? (
    <Loader />
  ) : (
    <Routes>
      {!aktif ? (
        <>
          {/* Redirect dari root ke signin */}
          <Route path="/" element={<Navigate to="/auth/signin" replace />} />

          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | SmileIn" />
                <SignIn onSignIn={handleSignIn} />
              </>
            }
          />
          {/* Redirect semua route unknown ke signin saat belum auth */}
          <Route path="*" element={<Navigate to="/auth/signin" replace />} />
        </>
      ) : (
        <Route
          path="/*"
          element={
            // Pass the userType to DefaultLayout
            <DefaultLayout userType={userType}>
              <Routes>
                {/* Dashboard Routes  */}
                <Route
                  index
                  element={
                    <>
                      <PageTitle title="Dasbor | SmileIn" />
                      <Dashboard />
                    </>
                  }
                />

                {/* Student Routes */}
                <Route
                  path='/student/student-list'
                  element={
                    <>
                      <PageTitle title="Daftar Mahasiswa | SmileIn" />
                      <StudentList />
                    </>
                  }
                />
                <Route path="/student/student-list/:id" element={
                  <>
                    <PageTitle title="Detail Mahasiswa | SmileIn" />
                    <StudentDetail />
                  </>
                } />

                {/* Course Routes */}
                <Route
                  path='/instructor/instructor-list'
                  element={
                    <>
                      <PageTitle title="Daftar Dosen | SmileIn" />
                      <InstructorList />
                    </>
                  }
                />
                <Route path="/instructor/instructor-list/:id" element={
                  <>
                    <PageTitle title="Detail Dosen | SmileIn" />
                    <InstructorDetail />
                  </>
                } />

                {/* Academic Routes */}
                <Route
                  path='/course/course-list'
                  element={
                    <>
                      <PageTitle title="Mata Kuliah | SmileIn" />
                      <CourseList />
                    </>
                  }
                />

                {/* Schedules */}
                <Route
                  path='/schedule/schedules'
                  element={
                    <>
                      <PageTitle title="Jadwal | SmileIn" />
                      <Schedules />
                    </>
                  }
                />

                {/* Attendance */}
                <Route
                  path='/attendance/attendance-list'
                  element={
                    <>
                      <PageTitle title="Attendance History | SmileIn" />
                      <AttendanceHistory />
                    </>
                  }
                />

                {/* Room */}
                <Route
                  path='/room/room-list'
                  element={
                    <>
                      <PageTitle title="Room | SmileIn" />
                      <Room />
                    </>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <>
                      <PageTitle title="Profile | SmileIn" />
                      <Profile />
                    </>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <>
                      <PageTitle title="Settings | SmileIn" />
                      <Settings />
                    </>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DefaultLayout>
          }
        />
      )}
    </Routes>
  );
}

export default App;