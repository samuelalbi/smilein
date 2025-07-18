import React, { useRef, useEffect } from 'react';
import Modal from '../Modal';
import { InstructorRead, InstructorUpdate } from '../../types/instructor';
import Swal from 'sweetalert2';

interface UpdateInstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentInstructor: InstructorRead | null;
    onUpdateInstructor: (instructorId: number, instructorData: InstructorUpdate) => Promise<void>;
}

const UpdateInstructorModal: React.FC<UpdateInstructorModalProps> = ({
    isOpen,
    onClose,
    currentInstructor,
    onUpdateInstructor
}) => {
    const nidnRef = useRef<HTMLInputElement>(null);
    const fullNameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const phoneNumberRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const isActiveRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Add comprehensive null checks
        if (currentInstructor && isOpen) {
            const safeSetValue = (
                ref: React.RefObject<HTMLInputElement>,
                value: string | number | boolean | undefined
            ) => {
                if (ref.current && value !== undefined) {
                    ref.current.value = value.toString();
                }
            };

            safeSetValue(nidnRef, currentInstructor.nidn);
            safeSetValue(fullNameRef, currentInstructor.full_name);
            safeSetValue(usernameRef, currentInstructor.username);
            safeSetValue(emailRef, currentInstructor.email);
            safeSetValue(phoneNumberRef, currentInstructor.phone_number);
            
            if (isActiveRef.current) {
                isActiveRef.current.checked = currentInstructor.is_active;
            }
        }
    }, [currentInstructor, isOpen]);

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
        if (!currentInstructor) {
            showAlert('Error', 'Tidak ada instruktur yang dipilih', 'error');
            return;
        }

        const nidn = nidnRef.current?.value;
        const fullName = fullNameRef.current?.value;
        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const phoneNumber = phoneNumberRef.current?.value;
        const password = passwordRef.current?.value;

        const updateData: InstructorUpdate = {};

        // Only add fields that have changed
        if (nidn && nidn !== currentInstructor.nidn) {
            updateData.nidn = nidn;
        }
        if (username && username !== currentInstructor.username) {
            updateData.username = username;
            
        }
        if (fullName && fullName !== currentInstructor.full_name) {
            updateData.full_name = fullName;
        }
        if (email && email !== currentInstructor.email) {
            updateData.email = email;
        }
        if (phoneNumber && phoneNumber !== currentInstructor.phone_number) {
            updateData.phone_number = phoneNumber;
        }
        if (password) {
            updateData.password = password;
        }
      

        // If no changes, show an alert
        if (Object.keys(updateData).length === 0) {
            showAlert('Info', 'Tidak ada perubahan yang dilakukan', 'warning');
            return;
        }

        try {
            await onUpdateInstructor(currentInstructor.instructor_id, updateData);
            onClose();
        } catch (err) {
            console.error('Failed to update instructor:', err);
            showAlert('Error!', 'Gagal memperbarui data instruktur', 'error');
        }
    };

    if (!currentInstructor) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Perbarui Data Instruktur"
            onConfirm={handleSubmit}
        >
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">NIDN</label>
                    <input
                        ref={nidnRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan NIDN"
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                    <input
                        ref={usernameRef}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Username"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                        ref={emailRef}
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Email"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor Telepon</label>
                    <input
                        ref={phoneNumberRef}
                        type="tel"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100"
                        placeholder="Masukkan Nomor Telepon"
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
                
            </div>
        </Modal>
    );
};

export default UpdateInstructorModal;