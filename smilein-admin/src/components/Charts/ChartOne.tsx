import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getAttendances } from '../../api/attendanceApi';

const AttendanceChart: React.FC = () => {
  // State for filtered data
  const [activeFilter, setActiveFilter] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for attendance data
  const [attendanceData, setAttendanceData] = useState<{
    labels: string[];
    present: number[];
    absent: number[];
    late: number[];
  }>({
    labels: [],
    present: [],
    absent: [],
    late: []
  });

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAttendances(0);

        // Process the data based on the active filter
        processAttendanceData(data, activeFilter);

      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Process attendance data based on filter
  const processAttendanceData = (data: any[], filter: 'day' | 'week' | 'month') => {
    // Group data by date for daily view
    // Group data by week for weekly view
    // Group data by month for monthly view

    let groupedData: Record<string, { present: number, absent: number, late: number, total: number }> = {};
    let dateFormat: Intl.DateTimeFormat;

    switch (filter) {
      case 'day':
        dateFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit' });
        // Group by date
        data.forEach(attendance => {
          const date = new Date(attendance.date);
          const formattedDate = dateFormat.format(date);

          if (!groupedData[formattedDate]) {
            groupedData[formattedDate] = { present: 0, absent: 0, late: 0, total: 0 };
          }

          groupedData[formattedDate].total += 1;
          if (attendance.status.toUpperCase() === 'PRESENT') {
            groupedData[formattedDate].present += 1;
          } else if (attendance.status.toUpperCase() === 'ABSENT') {
            groupedData[formattedDate].absent += 1;
          } else if (attendance.status.toUpperCase() === 'LATE') {
            groupedData[formattedDate].late += 1;
          }
        });
        break;

      case 'week':
        // Group by week number
        data.forEach(attendance => {
          const date = new Date(attendance.date);
          const weekNumber = getWeekNumber(date);
          const formattedWeek = `Minggu ${weekNumber}`;

          if (!groupedData[formattedWeek]) {
            groupedData[formattedWeek] = { present: 0, absent: 0, late: 0, total: 0 };
          }

          groupedData[formattedWeek].total += 1;
          if (attendance.status.toUpperCase() === 'PRESENT') {
            groupedData[formattedWeek].present += 1;
          } else if (attendance.status.toUpperCase() === 'ABSENT') {
            groupedData[formattedWeek].absent += 1;
          } else if (attendance.status.toUpperCase() === 'LATE') {
            groupedData[formattedWeek].late += 1;
          }
        });
        break;

      case 'month':
        dateFormat = new Intl.DateTimeFormat('id-ID', { month: 'short' });
        // Group by month
        data.forEach(attendance => {
          const date = new Date(attendance.date);
          const formattedMonth = dateFormat.format(date);

          if (!groupedData[formattedMonth]) {
            groupedData[formattedMonth] = { present: 0, absent: 0, late: 0, total: 0 };
          }

          groupedData[formattedMonth].total += 1;
          if (attendance.status.toUpperCase() === 'PRESENT') {
            groupedData[formattedMonth].present += 1;
          } else if (attendance.status.toUpperCase() === 'ABSENT') {
            groupedData[formattedMonth].absent += 1;
          } else if (attendance.status.toUpperCase() === 'LATE') {
            groupedData[formattedMonth].late += 1;
          }
        });
        break;
    }

    // Convert to percentages and prepare for chart
    const labels = Object.keys(groupedData);
    const presentPercentages = labels.map(label =>
      groupedData[label].total > 0 ? Math.round((groupedData[label].present / groupedData[label].total) * 100) : 0
    );
    const absentPercentages = labels.map(label =>
      groupedData[label].total > 0 ? Math.round((groupedData[label].absent / groupedData[label].total) * 100) : 0
    );
    const latePercentages = labels.map(label =>
      groupedData[label].total > 0 ? Math.round((groupedData[label].late / groupedData[label].total) * 100) : 0
    );

    setAttendanceData({
      labels,
      present: presentPercentages,
      absent: absentPercentages,
      late: latePercentages
    });
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Get the title based on the active filter
  const getTitle = () => {
    switch (activeFilter) {
      case 'day':
        return 'Presensi Harian';
      case 'week':
        return 'Presensi Mingguan';
      case 'month':
        return 'Presensi Bulanan';
      default:
        return 'Presensi Mahasiswa';
    }
  };

  // Calculate average attendance percentage
  const calculateAverage = (data: number[]) => {
    return data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
  };

  // Chart colors
  const chartColors = ['#3C50E0', '#DC2626', '#F97316'];

  // Chart options
  const options: ApexOptions = {
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      stacked: false,
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    colors: chartColors,
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: chartColors,
      strokeColors: '#FFFFFF',
      strokeWidth: 2,
      strokeOpacity: 1,
      fillOpacity: 1,
      discrete: [],
      shape: "circle",
      radius: 2,
      offsetX: 0,
      offsetY: 0,
      hover: {
        size: 6,
      },
      showNullDataPoints: true, // Memastikan titik kosong tetap ditampilkan
    },
    xaxis: {
      type: 'category',
      categories: attendanceData.labels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Persentase (%)',
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      min: 0,
      max: 100,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + '%';
        }
      }
    },
    title: {
      text: getTitle(),
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };

  // Series data for the chart
  const series = [
    {
      name: 'Hadir',
      data: attendanceData.present,
    },
    {
      name: 'Tidak Hadir',
      data: attendanceData.absent,
    },
    {
      name: 'Terlambat',
      data: attendanceData.late,
    },
  ];

  // Handle filter change
  const handleFilterChange = (filter: 'day' | 'week' | 'month') => {
    setActiveFilter(filter);
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-8">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Presensi Mahasiswa</p>
              <p className="text-sm font-medium">Semester Genap 2024/2025</p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${activeFilter === 'day'
                ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white'
                : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'
                }`}
              onClick={() => handleFilterChange('day')}
            >
              Hari
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${activeFilter === 'week'
                ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white'
                : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'
                }`}
              onClick={() => handleFilterChange('week')}
            >
              Minggu
            </button>
            <button
              className={`rounded py-1 px-3 text-xs font-medium ${activeFilter === 'month'
                ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white'
                : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'
                }`}
              onClick={() => handleFilterChange('month')}
            >
              Bulan
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-danger bg-danger bg-opacity-10 p-4 text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <div id="attendanceChart">
              <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className="bg-gray-50 dark:bg-meta-4 p-3 rounded-md">
              <p className="text-sm font-medium">
                Rata-rata Kehadiran: <span className="font-bold text-primary">{calculateAverage(attendanceData.present)}%</span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-meta-4 p-3 rounded-md">
              <p className="text-sm font-medium">
                Rata-rata Ketidakhadiran: <span className="font-bold text-danger">{calculateAverage(attendanceData.absent)}%</span>
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-meta-4 p-3 rounded-md">
              <p className="text-sm font-medium">
                Rata-rata Keterlambatan: <span className="font-bold text-warning">{calculateAverage(attendanceData.late)}%</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceChart;