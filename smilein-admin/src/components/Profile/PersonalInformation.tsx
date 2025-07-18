import React, { useState, useEffect, FormEvent } from 'react';
import { AdminRead, AdminUpdate } from '../../types/admin';
import { InstructorRead, InstructorUpdate } from '../../types/instructor';
import { updateAdmin } from '../../api/adminApi';
import { updateInstructor } from '../../api/instructorApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface PersonalInformationProps {
    initialData?: any;
    userType: string | null;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
    initialData,
    userType
}) => {
    const navigate = useNavigate();

    // Initialize form data with empty values
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        nidn: '',
        email: '',
        phone_number: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!initialData) return;

        // Extract values from initialData
        // For instructor data, we need to handle the structure correctly
        const newFormData = {
            full_name: initialData.full_name || '',
            username: initialData.username || '',
            // Properly handle NIDN from the appropriate source (either already in initialData or from instructor_info)
            nidn: initialData.nidn || '',
            email: initialData.email || '',
            phone_number: initialData.phone_number || '',
        };

        setFormData(newFormData);
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (!isEditing) {
            setIsEditing(true);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveClick = () => {
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
        }).then((result) => {
            if (result.isConfirmed) {
                // Submit the form programmatically
                document.getElementById('profile-form')?.dispatchEvent(
                    new Event('submit', { bubbles: true, cancelable: true })
                );
            }
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!initialData) {
                throw new Error("User data is missing");
            }

            // We need to use either admin_id or instructor_id based on what's available
            const userId = initialData.admin_id || initialData.instructor_id;
            if (!userId) throw new Error("User ID is missing");

            // Determine which API to use based on user type
            if (userType === "admin") {
                // For admin, only send admin-specific fields
                const adminData: AdminUpdate = {
                    full_name: formData.full_name,
                    username: formData.username
                };

                await updateAdmin(userId, adminData);
            } else if (userType === "instructor") {
                // For instructor, send all fields including instructor-specific ones
                const instructorData: InstructorUpdate = {
                    full_name: formData.full_name,
                    username: formData.username,
                    nidn: formData.nidn,
                    email: formData.email,
                    phone_number: formData.phone_number,
                };

                await updateInstructor(userId, instructorData);
            } else {
                throw new Error("Unknown user type");
            }

            // Remove authentication token from localStorage
            localStorage.removeItem('token');

            // Show success message using SweetAlert2
            Swal.fire({
                title: 'Sukses!',
                text: 'Profile berhasil diperbarui! Anda perlu login kembali dengan credential yang telah diperbarui.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(() => {
                // Redirect to sign-in page
                navigate('/signin');
            });
        } catch (error: any) {
            console.error('Error updating profile', error);

            // More specific error messages using SweetAlert2
            if (error.message === 'Network Error') {
                Swal.fire({
                    title: 'Error!',
                    text: 'CORS Error: Tidak dapat terhubung ke server. Silakan hubungi administrator.',
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: `Gagal memperbarui profil: ${error.message || 'Unknown error'}`,
                    icon: 'error',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Personal Information
                </h3>
            </div>
            <div className="p-7">
                <form id="profile-form" onSubmit={handleSubmit}>
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="fullName"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute left-4.5 top-4">
                                    <svg
                                        className="fill-current"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g opacity="0.8">
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                                fill=""
                                            />
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                                fill=""
                                            />
                                        </g>
                                    </svg>
                                </span>
                                <input
                                    className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                    type="text"
                                    name="full_name"
                                    id="fullName"
                                    placeholder="Full Name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-5.5">
                        <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="Username"
                        >
                            Username
                        </label>
                        <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="username"
                            id="Username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Show instructor fields only if userType is instructor */}
                    {userType === "instructor" && (
                        <>
                            <div className="mb-5.5">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="NIDN"
                                >
                                    NIDN
                                </label>
                                <input
                                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                    type="text"
                                    name="nidn"
                                    id="NIDN"
                                    placeholder="NIDN"
                                    value={formData.nidn}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-5.5">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="Email"
                                >
                                    Email
                                </label>
                                <input
                                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                    type="email"
                                    name="email"
                                    id="Email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mb-5.5">
                                <label
                                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    htmlFor="PhoneNumber"
                                >
                                    Phone Number
                                </label>
                                <input
                                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                    type="tel"
                                    name="phone_number"
                                    id="PhoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-4.5">
                        <button
                            className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                            type="button"
                            onClick={handleSaveClick}
                            disabled={!isEditing}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalInformation;