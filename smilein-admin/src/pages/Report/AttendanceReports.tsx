import { useState, useMemo } from 'react';
import _ from 'lodash';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import Swal from 'sweetalert2';

// Basic Card Components with Dark Mode Support
const Card = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`px-6 py-4 dark:text-gray-300 ${className}`}>
    {children}
  </div>
);

interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Alpha';
  timeIn?: string;
  major: string;
  semester: string;
  academicYear: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentPercentage: number;
  latePercentage: number;
  absentPercentage: number;
  permissionPercentage: number;
}

const sampleAttendanceData: AttendanceRecord[] = [
  {
    id: 1,
    studentId: '2020001',
    studentName: 'John Doe',
    course: 'Algoritma dan Pemrograman',
    date: '2024-01-05',
    status: 'Hadir',
    timeIn: '07:30:00',
    major: 'Teknik Informatika',
    semester: 'Ganjil',
    academicYear: '2023/2024'
  },
  {
    id: 2,
    studentId: '2020002',
    studentName: 'Jane Smith',
    course: 'Basis Data',
    date: '2024-01-05',
    status: 'Terlambat',
    timeIn: '08:15:00',
    major: 'Sistem Informasi',
    semester: 'Ganjil',
    academicYear: '2023/2024'
  }
];

const courses = [
  'Algoritma dan Pemrograman',
  'Basis Data',
  'Pemrograman Web',
  'Struktur Data',
  'Jaringan Komputer'
];

const majors = [
  'Teknik Informatika',
  'Sistem Informasi'
];

const AttendanceReports = () => {
  const [attendanceData] = useState<AttendanceRecord[]>(sampleAttendanceData);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    course: '',
    major: '',
    academicYear: '2023/2024',
    semester: 'Ganjil'
  });

  // Filter attendance data based on selected filters
  const filteredAttendance = useMemo(() => {
    return attendanceData.filter(record => {
      const dateInRange = (!filters.dateRange.start || record.date >= filters.dateRange.start) &&
        (!filters.dateRange.end || record.date <= filters.dateRange.end);
      const matchesCourse = !filters.course || record.course === filters.course;
      const matchesMajor = !filters.major || record.major === filters.major;
      const matchesAcademicYear = !filters.academicYear || record.academicYear === filters.academicYear;
      const matchesSemester = !filters.semester || record.semester === filters.semester;

      return dateInRange && matchesCourse && matchesMajor && matchesAcademicYear && matchesSemester;
    });
  }, [attendanceData, filters]);

  // Calculate attendance statistics
  const attendanceStats: AttendanceStats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(r => r.status === 'Hadir').length;
    const late = filteredAttendance.filter(r => r.status === 'Terlambat').length;
    const absent = filteredAttendance.filter(r => r.status === 'Alpha').length;
    const permission = filteredAttendance.filter(r => r.status === 'Izin').length;

    return {
      totalStudents: total,
      presentPercentage: (present / total) * 100,
      latePercentage: (late / total) * 100,
      absentPercentage: (absent / total) * 100,
      permissionPercentage: (permission / total) * 100
    };
  }, [filteredAttendance]);

  // Prepare data for attendance by course chart
  const attendanceByCourse = useMemo(() => {
    const groupedByCourse = _.groupBy(filteredAttendance, 'course');
    return Object.entries(groupedByCourse).map(([course, records]) => {
      const total = records.length;
      return {
        course,
        present: (records.filter(r => r.status === 'Hadir').length / total) * 100,
        late: (records.filter(r => r.status === 'Terlambat').length / total) * 100,
        absent: (records.filter(r => r.status === 'Alpha').length / total) * 100
      };
    });
  }, [filteredAttendance]);

  // Weekly attendance trend data
  const weeklyTrend = useMemo(() => {
    const groupedByWeek = _.groupBy(filteredAttendance, record => {
      const date = new Date(record.date);
      const week = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      return `Week ${week}`;
    });

    return Object.entries(groupedByWeek).map(([week, records]) => {
      const total = records.length;
      return {
        week,
        attendance: (records.filter(r => r.status === 'Hadir' || r.status === 'Terlambat').length / total) * 100
      };
    });
  }, [filteredAttendance]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    await Swal.fire({
      title: 'Ekspor Laporan',
      text: `Laporan akan diekspor dalam format ${format.toUpperCase()}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ekspor',
      cancelButtonText: 'Batal'
    });
  };

  const attendanceColumns: Column[] = [
    {
      header: 'NIM',
      accessor: 'studentId',
      minWidth: '120px'
    },
    {
      header: 'Nama',
      accessor: 'studentName',
      minWidth: '200px'
    },
    {
      header: 'Mata Kuliah',
      accessor: 'course',
      minWidth: '200px'
    },
    {
      header: 'Tanggal',
      accessor: 'date',
      minWidth: '120px',
      cell: (item: AttendanceRecord) => (
        <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '120px',
      cell: (item: AttendanceRecord) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          item.status === 'Hadir' ? 'bg-green-100 text-green-800' :
          item.status === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'Izin' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Program Studi',
      accessor: 'major',
      minWidth: '150px'
    }
  ];

  return (
    <div className="space-y-8 p-4">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Laporan Kehadiran</h2>
        <div className="space-x-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, start: e.target.value }
            }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: { ...prev.dateRange, end: e.target.value }
            }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Program Studi
          </label>
          <select
            value={filters.major}
            onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800"
          >
            <option value="">Semua Prodi</option>
            {majors.map((major, index) => (
              <option key={index} value={major}>{major}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mata Kuliah
          </label>
          <select
            value={filters.course}
            onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800"
          >
            <option value="">Semua Mata Kuliah</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tahun Akademik
          </label>
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800"
          >
            <option value="2023/2024">2023/2024</option>
            <option value="2022/2023">2022/2023</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Semester
          </label>
          <select
            value={filters.semester}
            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800"
          >
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {attendanceStats.presentPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Keterlambatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {attendanceStats.latePercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ketidakhadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {attendanceStats.absentPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Izin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {attendanceStats.permissionPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Kehadiran per Mata Kuliah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByCourse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="course"
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(17 24 39)',
                      border: '1px solid rgb(75 85 99)',
                      borderRadius: '0.375rem',
                      color: 'rgb(209 213 219)'
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'rgb(209 213 219)' }} />
                  <Bar dataKey="present" name="Hadir" fill="#22c55e" />
                  <Bar dataKey="late" name="Terlambat" fill="#eab308" />
                  <Bar dataKey="absent" name="Alpha" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Kehadiran Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <YAxis
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(17 24 39)',
                      border: '1px solid rgb(75 85 99)',
                      borderRadius: '0.375rem',
                      color: 'rgb(209 213 219)'
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'rgb(209 213 219)' }} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    name="Persentase Kehadiran"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          <DynamicTable
            columns={attendanceColumns}
            data={filteredAttendance}
            className="shadow-sm"
            searchable={true}
            searchFields={['studentId', 'studentName', 'course']}
          />
        </CardContent>
      </Card>

      {/* Summary by Major */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap per Program Studi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Program Studi
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Mahasiswa
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hadir
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Terlambat
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Alpha
                  </th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Izin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {majors.map((major) => {
                  const majorData = filteredAttendance.filter(record => record.major === major);
                  const total = majorData.length;
                  const present = majorData.filter(r => r.status === 'Hadir').length;
                  const late = majorData.filter(r => r.status === 'Terlambat').length;
                  const absent = majorData.filter(r => r.status === 'Alpha').length;
                  const permission = majorData.filter(r => r.status === 'Izin').length;

                  return (
                    <tr key={major}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {major}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {present} ({((present / total) * 100).toFixed(1)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {late} ({((late / total) * 100).toFixed(1)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {absent} ({((absent / total) * 100).toFixed(1)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {permission} ({((permission / total) * 100).toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;