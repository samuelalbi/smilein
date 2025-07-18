import React, { useState } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../../api/client';

interface ChangePasswordProps {
    userType?: 'admin' | 'instructor';  // Define the user type prop
    userId?: number | string;
}

interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ userType = 'admin', userId }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const changePassword = async (data: ChangePasswordRequest) => {
        try {
            // Use different endpoints based on user type
            const endpoint = userType === 'instructor'
                ? '/instructors/change-password'
                : '/admins/change-password';

            const response = await apiClient.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`Error changing ${userType} password:`, error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New password and confirmation do not match' });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return;
        }

        // Show warning modal using SweetAlert2
        Swal.fire({
            title: 'Peringatan!',
            text: 'Mengedit berarti memasukan kembali credential anda saat login. Anda akan diminta untuk login kembali setelah perubahan disimpan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Lanjutkan',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true);
                setMessage(null);

                try {
                    // Prepare the data for API request
                    const passwordData: ChangePasswordRequest = {
                        current_password: formData.currentPassword,
                        new_password: formData.newPassword,
                        confirm_password: formData.confirmPassword
                    };

                    // Make the API call
                    await changePassword(passwordData);

                    setMessage({ type: 'success', text: 'Password updated successfully. Please log in again with your new password.' });
                    setFormData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });

                    // Log out after successful password change
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login'; // Redirect to login page
                    }, 2000);
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Failed to update password. Please try again.';
                    setMessage({ type: 'error', text: errorMessage });
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Change Password {userType === 'instructor' ? '(Instructor)' : '(Admin)'}
                </h3>
            </div>
            <form id="password-form" onSubmit={handleSubmit}>
                <div className="p-6.5">
                    {message && (
                        <div className={`mb-5 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} px-4 py-3`}>
                            {message.text}
                        </div>
                    )}

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Current Password <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Enter your current password"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            New Password <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Enter your new password"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                            Confirm New Password <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your new password"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;