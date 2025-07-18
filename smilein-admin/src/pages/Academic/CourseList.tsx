import { useState, useEffect, useRef } from 'react';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';
import * as courseApi from '../../api/courseApi';
import { Course, CourseCreate, CourseUpdate } from '../../types/course';
import Swal from 'sweetalert2';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    onConfirm,
    confirmText = "Simpan",
    cancelText = "Batal"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">{title}</h2>
                </div>

                <div className="px-6 py-4 dark:text-gray-200">{children}</div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};



const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

    const createNameRef = useRef<HTMLInputElement>(null);
    const createSksRef = useRef<HTMLInputElement>(null);
    const updateNameRef = useRef<HTMLInputElement>(null);
    const updateSksRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await courseApi.getCourses();
            setCourses(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (title: string, message: string, icon: 'success' | 'error' | 'warning'): void => {
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            customClass: {
                container: 'font-sans'
            }
        });
    };

    const handleCreateClick = (): void => {
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = async (): Promise<void> => {
        const courseName = createNameRef.current?.value;
        const sks = createSksRef.current?.value;

        if (!courseName || !sks) {
            showAlert('Error', 'Semua field harus diisi', 'error');
            return;
        }

        try {
            const newCourse = await courseApi.createCourse({
                course_name: courseName,
                sks: parseInt(sks)
            } as CourseCreate);

            setCourses([...courses, newCourse]);
            setCreateModalOpen(false);
            showAlert('Berhasil!', 'Mata kuliah baru telah ditambahkan', 'success');
        } catch (err) {
            console.error('Failed to create course:', err);
            showAlert('Error!', 'Gagal menambahkan mata kuliah', 'error');
        }
    };

    const handleUpdateClick = (course: Course): void => {
        setCurrentCourse(course);
        setUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (): Promise<void> => {
        const courseName = updateNameRef.current?.value;
        const sks = updateSksRef.current?.value;

        if (!courseName || !sks || !currentCourse) {
            showAlert('Error', 'Semua field harus diisi', 'error');
            return;
        }

        try {
            const updatedCourse = await courseApi.updateCourse(
                currentCourse.course_id,
                {
                    course_name: courseName,
                    sks: parseInt(sks)
                } as CourseUpdate
            );

            setCourses(courses.map(c =>
                c.course_id === currentCourse.course_id ? updatedCourse : c
            ));
            setUpdateModalOpen(false);
            showAlert('Berhasil!', 'Mata kuliah telah diperbarui', 'success');
        } catch (err) {
            console.error('Failed to update course:', err);
            showAlert('Error!', 'Gagal memperbarui mata kuliah', 'error');
        }
    };

    const handleDeleteClick = (course: Course): void => {
        setCurrentCourse(course);
        // Using SweetAlert for delete confirmation instead of the modal
        Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: 'Apakah anda yakin ingin menghapus mata kuliah ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteConfirm();
            }
        });
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!currentCourse) return;

        try {
            await courseApi.deleteCourse(currentCourse.course_id);
            setCourses(courses.filter(c => c.course_id !== currentCourse.course_id));
            showAlert('Terhapus!', 'Mata kuliah telah dihapus.', 'success');
        } catch (err: any) {
            console.error('Failed to delete course:', err);

            // Check if the error is due to course being in use (has schedules)
            if (err.response && err.response.status === 400 &&
                err.response.data && err.response.data.detail &&
                err.response.data.detail.includes('cannot be deleted because it is currently in use')) {
                showAlert(
                    'Gagal Menghapus!',
                    'Mata kuliah ini tidak dapat dihapus karena sedang digunakan dalam jadwal kuliah.',
                    'error'
                );
            } else {
                showAlert('Error!', 'Gagal menghapus mata kuliah.', 'error');
            }
        }
    };

    const courseColumns: Column[] = [
        {
            header: 'ID Mata Kuliah',
            accessor: 'course_id',
            minWidth: '120px',
        },
        {
            header: 'Nama Mata Kuliah',
            accessor: 'course_name',
            minWidth: '200px',
        },
        {
            header: 'SKS',
            accessor: 'sks',
            minWidth: '80px',
        },
        {
            header: 'Tanggal Dibuat',
            accessor: 'created_at',
            minWidth: '120px',
            cell: (item: Course) => (
                <span>
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            ),
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Daftar Mata Kuliah</h2>
                <button
                    onClick={handleCreateClick}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg  hover:bg-green-600 text-sm flex items-center transition-colors duration-200 dark:bg-green-600 dark:hover:bg-green-700"

                >
                    Tambah Mata Kuliah
                </button>
            </div>

            <DynamicTable
                columns={courseColumns}
                data={courses}
                className="shadow-sm"
                searchable
                filterable
                searchFields={['course_name']}
                renderActions={(course: Course) => (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleUpdateClick(course)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteClick(course)}
                            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                        >
                            Hapus
                        </button>
                    </div>
                )}
            />

            {/* Create Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Tambah Mata Kuliah Baru"
                onConfirm={handleCreateSubmit}
            >
                <div className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Mata Kuliah</label>
                        <input
                            ref={createNameRef}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Masukkan nama mata kuliah"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SKS</label>
                        <input
                            ref={createSksRef}
                            type="number"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out dark:placeholder-gray-400"
                            placeholder="Masukkan jumlah SKS"
                            required
                        />
                    </div>
                </div>
            </Modal>

            {/* Update Modal */}
            <Modal
                isOpen={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                title="Edit Mata Kuliah"
                onConfirm={handleUpdateSubmit}
            >
                {currentCourse && (
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Mata Kuliah</label>
                            <input
                                ref={updateNameRef}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentCourse.course_name}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SKS</label>
                            <input
                                ref={updateSksRef}
                                type="number"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-200 ease-in-out"
                                defaultValue={currentCourse.sks}
                                required
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CourseList;