import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getStudents } from '../../api/studentApi';
import { StudentRead } from '../../types/student';
import Swal from 'sweetalert2';
import apiClient from '../../api/client';

interface Schedule {
  schedule_id: number;
  course: {
    course_id: number;
    course_name: string;
  };
  room: {
    name: string;
  };
  day_of_week: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  instructor: {
    full_name: string;
  };
}

interface CreateAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAttendanceModal: React.FC<CreateAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [students, setStudents] = useState<StudentRead[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add loading state for student filtering
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Multiple mode states
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [studentsWithoutAttendance, setStudentsWithoutAttendance] = useState<StudentRead[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<number | ''>('');
  const [validating, setValidating] = useState(false);

  // Get current date in YYYY-MM-DD format (WIB timezone)
  const getCurrentDate = (): string => {
    const today = new Date();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta'
    }).format(today);
  };

  // Get current time in HH:mm format (WIB timezone)
  const getCurrentTime = (): string => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
  };

  // Check if schedule end time has passed
  const isScheduleActive = (endTime: string): boolean => {
    const currentTime = getCurrentTime();

    // Convert times to comparable format (remove seconds if present)
    const normalizeTime = (time: string): string => {
      return time.substring(0, 5); // Get HH:mm part only
    };

    const normalizedCurrentTime = normalizeTime(currentTime);
    const normalizedEndTime = normalizeTime(endTime);

    // Compare times as strings (works for HH:mm format)
    return normalizedEndTime > normalizedCurrentTime;
  };

  // Load students and schedules when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Reset form when modal opens
      setSelectedStudents(new Set());
      setSelectedSchedule('');
      setFilteredSchedules([]);
      setStudentsWithoutAttendance([]);
      setSearchStudent('');
      setSelectAllChecked(false);
      setLoadingStudents(false);
    }
  }, [isOpen]);

  // Filter schedules when schedules data changes
  useEffect(() => {
    const currentDate = getCurrentDate();
    const todaySchedules = schedules.filter(schedule => {
      // Check if schedule is for today
      const isToday = schedule.schedule_date === currentDate;

      // Check if schedule end time hasn't passed yet
      const isActive = isScheduleActive(schedule.end_time);

      return isToday && isActive;
    });

    setFilteredSchedules(todaySchedules);
  }, [schedules]);

  // Filter students without attendance when schedule is selected
  useEffect(() => {
    if (selectedSchedule && students.length > 0) {
      filterStudentsWithoutAttendance();
    } else {
      setStudentsWithoutAttendance([]);
      setSelectedStudents(new Set());
      setSelectAllChecked(false);
      setLoadingStudents(false);
    }
  }, [selectedSchedule, students]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsData = await getStudents();
      setStudents(studentsData);

      // Fetch schedules
      const response = await apiClient.get<Schedule[]>('/schedules/');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data mahasiswa dan jadwal',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter students who don't have attendance for the selected schedule
  const filterStudentsWithoutAttendance = async () => {
    if (!selectedSchedule || students.length === 0) {
      setLoadingStudents(false);
      return;
    }

    setLoadingStudents(true);
    try {
      const availableStudents: StudentRead[] = [];

      // Process students in batches for better performance
      const batchSize = 10;
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        const batchPromises = batch.map(async (student) => {
          const exists = await checkAttendanceExists(student.student_id, Number(selectedSchedule));
          return { student, exists };
        });

        const batchResults = await Promise.all(batchPromises);
        
        // Add students without attendance to the list
        batchResults.forEach(({ student, exists }) => {
          if (!exists) {
            availableStudents.push(student);
          }
        });
      }

      setStudentsWithoutAttendance(availableStudents);
      // Reset selections when students list changes
      setSelectedStudents(new Set());
      setSelectAllChecked(false);
    } catch (error) {
      console.error('Error filtering students:', error);
      setStudentsWithoutAttendance(students);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Check if attendance record already exists
  const checkAttendanceExists = async (studentId: number, scheduleId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get('/attendances/', {
        params: {
          student_id: studentId,
          schedule_id: scheduleId
        }
      });

      return response.data && response.data.length > 0;
    } catch (error) {
      console.error('Error checking attendance existence:', error);
      return false;
    }
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    const newSelectedStudents = new Set(selectedStudents);
    if (checked) {
      newSelectedStudents.add(studentId);
    } else {
      newSelectedStudents.delete(studentId);
    }
    setSelectedStudents(newSelectedStudents);

    // Update select all checkbox
    const filteredStudents = getFilteredStudentsForSelection();
    setSelectAllChecked(filteredStudents.length > 0 && filteredStudents.every(s => newSelectedStudents.has(s.student_id)));
  };

  const handleSelectAll = (checked: boolean) => {
    const filteredStudents = getFilteredStudentsForSelection();
    const newSelectedStudents = new Set(selectedStudents);

    if (checked) {
      filteredStudents.forEach(student => newSelectedStudents.add(student.student_id));
    } else {
      filteredStudents.forEach(student => newSelectedStudents.delete(student.student_id));
    }

    setSelectedStudents(newSelectedStudents);
    setSelectAllChecked(checked);
  };

  const getFilteredStudentsForSelection = (): StudentRead[] => {
    const studentsToFilter = selectedSchedule ? studentsWithoutAttendance : students;

    if (!searchStudent) return studentsToFilter;

    return studentsToFilter.filter(student =>
      student.full_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      student.nim.toLowerCase().includes(searchStudent.toLowerCase())
    );
  };

  const handleSubmit = async () => {
    if (selectedStudents.size === 0) {
      Swal.fire({
        title: 'Peringatan',
        text: 'Silakan pilih minimal satu mahasiswa',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    if (!selectedSchedule) {
      Swal.fire({
        title: 'Peringatan',
        text: 'Silakan pilih jadwal',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Konfirmasi',
      text: `Anda akan menambahkan data kehadiran untuk ${selectedStudents.size} mahasiswa. Lanjutkan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lanjutkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2bc96a',
      cancelButtonColor: '#9CA3AF',
    });

    if (!confirmResult.isConfirmed) return;

    setValidating(true);
    try {
      const attendancePromises = Array.from(selectedStudents).map(async (studentId) => {
        // Double check if attendance exists
        const exists = await checkAttendanceExists(studentId, Number(selectedSchedule));
        if (!exists) {
          return apiClient.post('/attendances/', {
            student_id: studentId,
            schedule_id: selectedSchedule
          });
        }
        return null;
      });

      const results = await Promise.allSettled(attendancePromises);

      const successful = results.filter(result =>
        result.status === 'fulfilled' && result.value !== null
      ).length;

      const failed = results.filter(result =>
        result.status === 'rejected' || result.value === null
      ).length;

      if (successful > 0) {
        Swal.fire({
          title: 'Berhasil!',
          text: `${successful} data kehadiran berhasil ditambahkan${failed > 0 ? `, ${failed} gagal atau sudah ada` : ''}`,
          icon: successful === selectedStudents.size ? 'success' : 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6'
        });

        setSelectedStudents(new Set());
        setSelectedSchedule('');
        setSelectAllChecked(false);
        onClose();
        onSuccess();
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Semua data gagal ditambahkan atau sudah ada',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error('Failed to create multiple attendances:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat menambahkan data kehadiran',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setValidating(false);
    }
  };

  const formatScheduleOption = (schedule: Schedule): string => {
    const courseName = schedule.course?.course_name || 'Unknown Course';
    const roomName = schedule.room?.name || '';
    const startTime = schedule.start_time || '';
    const endTime = schedule.end_time || '';

    return `${courseName}, ${startTime}-${endTime} (${roomName})`;
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrentDateTime = (): string => {
    const now = new Date();
    const date = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);

    const time = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);

    return `${date}, ${time} WIB`;
  };

  const currentDate = getCurrentDate();
  const currentDateTime = formatCurrentDateTime();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Kehadiran Mahasiswa"
      onConfirm={handleSubmit}
      confirmDisabled={validating || loadingStudents}
      size="large"
    >
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Info about current date and time */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-400">
            <p className="text-sm text-green-700 dark:text-green-300">
              <span className="font-semibold">Waktu saat ini:</span> {currentDateTime}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Hanya jadwal untuk hari ini yang belum berakhir yang ditampilkan
            </p>
          </div>

          {/* Schedule Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Jadwal (Hari Ini - Aktif)
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(Number(e.target.value) || '')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
              disabled={validating}
            >
              <option value="">Pilih Jadwal Terlebih Dahulu</option>
              {filteredSchedules.map((schedule) => (
                <option key={schedule.schedule_id} value={schedule.schedule_id}>
                  {formatScheduleOption(schedule)}
                </option>
              ))}
            </select>
            {filteredSchedules.length === 0 && !loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Tidak ada jadwal aktif untuk hari ini (semua jadwal mungkin sudah berakhir)
              </p>
            )}
          </div>

          {/* Student Selection */}
          {selectedSchedule && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pilih Mahasiswa ({selectedStudents.size} dipilih)
              </label>

              {/* Loading Students Indicator */}
              {loadingStudents && (
                <div className="flex justify-center items-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Memuat data mahasiswa...
                  </span>
                </div>
              )}

              {/* Student Selection Interface - Only show when not loading */}
              {!loadingStudents && (
                <>
                  {/* Search Box */}
                  <input
                    type="text"
                    placeholder="Cari mahasiswa (nama atau NIM)..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full px-4 py-2 mb-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                  />

                  {/* Select All Checkbox */}
                  <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Pilih Semua ({getFilteredStudentsForSelection().length} mahasiswa)</span>
                    </label>
                  </div>

                  {/* Students List */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    {getFilteredStudentsForSelection().length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {studentsWithoutAttendance.length === 0
                          ? 'Semua mahasiswa sudah memiliki data kehadiran untuk jadwal ini'
                          : 'Tidak ada mahasiswa yang sesuai dengan pencarian'
                        }
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {getFilteredStudentsForSelection().map((student) => (
                          <label key={student.student_id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.student_id)}
                              onChange={(e) => handleStudentSelection(student.student_id, e.target.checked)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {student.full_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                NIM: {student.nim}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Summary */}
          {selectedStudents.size > 0 && selectedSchedule && !loadingStudents && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                Ringkasan Penambahan Kehadiran:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <span className="font-semibold">Jumlah Mahasiswa:</span> {selectedStudents.size} mahasiswa
                </li>
                <li>
                  <span className="font-semibold">Mata Kuliah:</span>{' '}
                  {filteredSchedules.find(s => s.schedule_id === Number(selectedSchedule))?.course.course_name || ''}
                </li>
                <li>
                  <span className="font-semibold">Pengajar:</span>{' '}
                  {filteredSchedules.find(s => s.schedule_id === Number(selectedSchedule))?.instructor.full_name || ''}
                </li>
                <li>
                  <span className="font-semibold">Waktu:</span>{' '}
                  {filteredSchedules.find(s => s.schedule_id === Number(selectedSchedule))?.start_time || ''} - {filteredSchedules.find(s => s.schedule_id === Number(selectedSchedule))?.end_time || ''}
                </li>
                <li>
                  <span className="font-semibold">Tanggal:</span> {formatDate(currentDate)}
                </li>
              </ul>
            </div>
          )}

          {validating && (
            <div className="flex justify-center mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-blue-500">Memproses data kehadiran...</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CreateAttendanceModal;