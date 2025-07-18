import React, { useRef, useEffect } from 'react';
import Modal from '../Modal';
import { StudentRead, StudentUpdate } from '../../types/student';
import Swal from 'sweetalert2';

interface UpdateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStudent: StudentRead | null;
    onUpdateStudent: (studentId: number, studentData: StudentUpdate) => Promise<void>;
}

const UpdateStudentModal: React.FC<UpdateStudentModalProps> = ({
    isOpen,
    onClose,
    currentStudent,
    onUpdateStudent
}) => {
    const usernameRef = useRef<HTMLInputElement>(null);
    const fullNameRef = useRef<HTMLInputElement>(null);
    const nimRef = useRef<HTMLInputElement>(null); // Added NIM ref
    const majorNameRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const isApprovedRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Add comprehensive null checks
        if (currentStudent && isOpen) {
            const safeSetValue = (
                ref: React.RefObject<HTMLInputElement>,
                value: string | number | boolean | undefined
            ) => {
                if (ref.current && value !== undefined) {
                    ref.current.value = value.toString();
                }
            };

            safeSetValue(usernameRef, currentStudent.username);
            safeSetValue(fullNameRef, currentStudent.full_name);
            safeSetValue(nimRef, currentStudent.nim); // Set NIM value
            safeSetValue(majorNameRef, currentStudent.major_name);
            safeSetValue(yearRef, currentStudent.year);

            if (isApprovedRef.current) {
                isApprovedRef.current.checked = currentStudent.is_approved || false;
            }
        }
    }, [currentStudent, isOpen]);

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

    const handleSubmit = async (): Promise<void> => {
        if (!currentStudent) {
            showAlert('Error', 'Tidak ada mahasiswa yang dipilih', 'error');
            return;
        }

        const username = usernameRef.current?.value;
        const fullName = fullNameRef.current?.value;
        const nim = nimRef.current?.value; // Get NIM value
        const majorName = majorNameRef.current?.value;
        const year = yearRef.current?.value;
        const password = passwordRef.current?.value;
        const isApproved = isApprovedRef.current?.checked;

        const updateData: StudentUpdate = {};

        // Only add fields that have changed
        if (username && username !== currentStudent.username) {
            updateData.username = username;
        }
        if (fullName && fullName !== currentStudent.full_name) {
            updateData.full_name = fullName;
        }
        if (nim && nim !== currentStudent.nim) { // Check if NIM has changed
            updateData.nim = nim;
        }
        if (majorName && majorName !== currentStudent.major_name) {
            updateData.major_name = majorName;
        }
        if (year && year !== currentStudent.year) {
            updateData.year = year;
        }
        if (password) {
            updateData.password = password;
        }
        if (isApproved !== undefined && isApproved !== currentStudent.is_approved) {
            updateData.is_approved = isApproved;
        }

        // If no changes, show an alert
        if (Object.keys(updateData).length === 0) {
            showAlert('Info', 'Tidak ada perubahan yang dilakukan', 'warning');
            return;
        }

        try {
            await onUpdateStudent(currentStudent.student_id, updateData);
            onClose();
        } catch (err) {
            console.error('Failed to update student:', err);
            showAlert('Error!', 'Gagal memperbarui data mahasiswa', 'error');
        }
    };

    if (!currentStudent) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Perbarui Data Mahasiswa"
            onConfirm={handleSubmit}
        >
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                    <input
                        ref={usernameRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Username"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap</label>
                    <input
                        ref={fullNameRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Nama Lengkap"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">NIM</label>
                    <input
                        ref={nimRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan NIM"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Program Studi</label>
                    <input
                        ref={majorNameRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Program Studi"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tahun Angkatan</label>
                    <input
                        ref={yearRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Tahun Angkatan"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password (Optional)</label>
                    <input
                        ref={passwordRef}
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Password Baru (Opsional)"
                    />
                </div>
                <div className="col-span-2">
                    <label className="flex items-center">
                        <input
                            ref={isApprovedRef}
                            type="checkbox"
                            className="w-5 h-5 rounded focus:ring-blue-500 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Disetujui</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
};

export default UpdateStudentModal;