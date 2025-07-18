import { useState, useMemo } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import Swal from 'sweetalert2';

interface LateReason {
  id: number;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  reason: string;
  submittedAt: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  comment?: string;
  major: string;
}

const sampleLateReasons: LateReason[] = [
  {
    id: 1,
    studentId: '2020001',
    studentName: 'John Doe',
    course: 'Algoritma dan Pemrograman',
    date: '2024-01-05',
    reason: 'Kendala transportasi umum, bus terlambat 30 menit',
    submittedAt: '2024-01-05T07:45:00Z',
    status: 'Pending',
    major: 'Teknik Informatika'
  },
  {
    id: 2,
    studentId: '2020002',
    studentName: 'Jane Smith',
    course: 'Basis Data',
    date: '2024-01-05',
    reason: 'Kemacetan di jalan utama karena kecelakaan',
    submittedAt: '2024-01-05T10:00:00Z',
    status: 'Disetujui',
    comment: 'Sudah dikonfirmasi dengan pihak kepolisian',
    major: 'Sistem Informasi'
  },
  {
    id: 3,
    studentId: '2020003',
    studentName: 'Bob Johnson',
    course: 'Pemrograman Web',
    date: '2024-01-06',
    reason: 'Bangun kesiangan',
    submittedAt: '2024-01-06T08:30:00Z',
    status: 'Ditolak',
    comment: 'Alasan tidak dapat diterima',
    major: 'Teknik Informatika'
  }
];

const courses = [
  'Algoritma dan Pemrograman',
  'Basis Data',
  'Pemrograman Web',
  'Struktur Data',
  'Jaringan Komputer'
];

const LateReport = () => {
  const [lateReasons] = useState<LateReason[]>(sampleLateReasons);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Filter late reasons based on selected filters
  const filteredLateReasons = useMemo(() => {
    return lateReasons.filter(report => {
      const dateInRange = (!dateRange.start || report.date >= dateRange.start) &&
        (!dateRange.end || report.date <= dateRange.end);
      const matchesCourse = !selectedCourse || report.course === selectedCourse;
      const matchesStatus = !selectedStatus || report.status === selectedStatus;

      return dateInRange && matchesCourse && matchesStatus;
    });
  }, [lateReasons, dateRange, selectedCourse, selectedStatus]);

  const showDetails = async (report: LateReason) => {
    await Swal.fire({
      title: 'Detail Keterlambatan',
      html: `
                <div class="space-y-6 text-left">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Informasi Mahasiswa</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">NIM</p>
                                <p class="font-medium">${report.studentId}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Nama</p>
                                <p class="font-medium">${report.studentName}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold mb-2">Detail Laporan</h3>
                        <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                                <p class="text-sm text-gray-600">Mata Kuliah</p>
                                <p class="font-medium">${report.course}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Tanggal</p>
                                <p class="font-medium">
                                    ${new Date(report.date).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Alasan Keterlambatan</p>
                                <p class="font-medium">${report.reason}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Status</p>
                                <p class="font-medium">
                                    <span class="px-2 py-1 rounded-full text-sm ${report.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
          report.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
        }">
                                        ${report.status}
                                    </span>
                                </p>
                            </div>
                            ${report.comment ? `
                                <div>
                                    <p class="text-sm text-gray-600">Komentar</p>
                                    <p class="font-medium">${report.comment}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `,
      width: '600px',
      showCloseButton: true,
      showConfirmButton: false
    });
  };

  const handleApproveReject = async (_report: LateReason, action: 'approve' | 'reject') => {
    const { value: comment } = await Swal.fire({
      title: action === 'approve' ? 'Setujui Keterlambatan' : 'Tolak Keterlambatan',
      input: 'textarea',
      inputLabel: 'Komentar (Opsional)',
      inputPlaceholder: 'Masukkan komentar...',
      showCancelButton: true,
      confirmButtonText: action === 'approve' ? 'Setujui' : 'Tolak',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (action === 'reject' && !value) {
          return 'Komentar wajib diisi untuk penolakan';
        }
        return null;
      }
    });

    if (comment !== undefined) {
      await Swal.fire(
        'Berhasil!',
        `Laporan keterlambatan telah ${action === 'approve' ? 'disetujui' : 'ditolak'}.`,
        'success'
      );
    }
  };

  const lateReasonColumns: Column[] = [
    {
      header: 'ID',
      accessor: 'id',
      minWidth: '80px'
    },
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
      cell: (item: LateReason) => (
        <span>
          {new Date(item.date).toLocaleDateString('id-ID')}
        </span>
      )
    },
    {
      header: 'Alasan',
      accessor: 'reason',
      minWidth: '250px',
      cell: (item: LateReason) => (
        <span className="truncate block max-w-xs">
          {item.reason}
        </span>
      )
    },
    {
      header: 'Tanggal Submit',
      accessor: 'submittedAt',
      minWidth: '150px',
      cell: (item: LateReason) => (
        <span>
          {new Date(item.submittedAt).toLocaleString('id-ID')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '120px',
      cell: (item: LateReason) => (
        <span className={`px-2 py-1 rounded-full text-sm ${item.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
          item.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Laporan Keterlambatan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mata Kuliah
          </label>
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 pr-10 outline-none focus:border-primary appearance-none"
            >
              <option value="">Semua Mata Kuliah</option>
              {courses.map((course, index) => (
                <option key={index} value={course}>{course}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 pr-10 outline-none focus:border-primary appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <DynamicTable
        columns={lateReasonColumns}
        data={filteredLateReasons}
        className="shadow-sm"
        searchable={true}
        searchFields={['studentId', 'studentName']}
        renderActions={(report: LateReason) => (
          <div className="flex space-x-2">
            {report.status === 'Pending' && (
              <>
                <button
                  onClick={() => handleApproveReject(report, 'approve')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Setujui
                </button>
                <button
                  onClick={() => handleApproveReject(report, 'reject')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Tolak
                </button>
              </>
            )}
            <button
              onClick={() => showDetails(report)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Detail
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default LateReport;