import React, { useState, useRef } from 'react';
import { getAdminProfilePicture, uploadProfilePicture as uploadAdminProfilePicture } from '../../api/adminApi';
import { getInstructorProfilePicture, uploadProfilePicture as uploadInstructorProfilePicture } from '../../api/instructorApi';
import userThree from '../../images/user/user-03.png';
import Swal from 'sweetalert2';

interface UserPhotoProps {
  userId?: number;
  userType?: 'admin' | 'instructor';
  currentProfilePicture?: string | null;
  className?: string;
}

const UserPhoto: React.FC<UserPhotoProps> = ({
  userId,
  userType = 'admin',
  currentProfilePicture = userThree
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(currentProfilePicture);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProfilePicture = async () => {
    if (!userId) return null;

    try {
      if (userType === 'instructor') {
        return await getInstructorProfilePicture(userId);
      } else {
        return await getAdminProfilePicture(userId);
      }
    } catch (error) {
      console.error(`Error fetching ${userType} profile picture`, error);
      throw error;
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!userId) return null;

    try {
      if (userType === 'instructor') {
        return await uploadInstructorProfilePicture(userId, file);
      } else {
        return await uploadAdminProfilePicture(userId, file);
      }
    } catch (error) {
      console.error(`Error uploading ${userType} profile picture`, error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFile && userId) {
      try {
        setIsUploading(true);
        await uploadPhoto(selectedFile);

        // After successful upload, fetch the updated profile picture URL
        const profilePicData = await getProfilePicture();
        if (profilePicData) {
          setPreviewImage(profilePicData.profile_picture_url);
        }

        // Show success message with Swal
        Swal.fire({
          title: 'Success!',
          text: 'Profile picture uploaded successfully!',
          icon: 'success',
          confirmButtonColor: '#3C50E0',
          timer: 1500
        }).then(() => {
          // Reload the page after the alert is closed
          window.location.reload();
        });
      } catch (error) {
        console.error('Error uploading profile picture', error);
        // Show error message with Swal
        Swal.fire({
          title: 'Error!',
          text: 'Failed to upload profile picture',
          icon: 'error',
          confirmButtonColor: '#3C50E0'
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // Show warning message with Swal
      Swal.fire({
        title: 'Warning!',
        text: `Please select a file and ensure ${userType} ID is available`,
        icon: 'warning',
        confirmButtonColor: '#3C50E0'
      });
    }
  };

  const handleDelete = () => {
    if (previewImage && previewImage !== userThree) {
      // Show confirm dialog with Swal
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove your profile picture?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3C50E0',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedFile(null);
          setPreviewImage(null);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          Swal.fire({
            title: 'Deleted!',
            text: 'Your profile picture has been removed.',
            icon: 'success',
            timer: 1500
          });
        }
      });
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    // Ask for confirmation if there are unsaved changes
    if (selectedFile) {
      Swal.fire({
        title: 'Discard changes?',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3C50E0',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No, keep editing'
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset to original state
          setSelectedFile(null);
          setPreviewImage(currentProfilePicture);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });
    } else {
      // Reset to original state if no changes
      setSelectedFile(null);
      setPreviewImage(currentProfilePicture);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to format image URL
  const formatImageUrl = (url: string | null) => {
    if (!url) return userThree;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `https://web-production-b963.up.railway.app${url}`;
    return url;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Your Photo {userType === 'instructor' ? '(Instructor)' : '(Admin)'}
        </h3>
      </div>
      <div className="p-7">
        <form action="#">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-full">
              <img
                src={formatImageUrl(previewImage)}
                alt="User"
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="mb-1.5 text-black dark:text-white">
                Edit your photo
              </span>
              <span className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm hover:text-primary"
                  disabled={isUploading}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="text-sm hover:text-primary"
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Update'}
                </button>
              </span>
            </div>
          </div>

          <div
            id="FileUpload"
            className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                    fill="#3C50E0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                    fill="#3C50E0"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                    fill="#3C50E0"
                  />
                </svg>
              </span>
              <p>
                <span className="text-primary">Click to upload</span> or
                drag and drop
              </p>
              <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
              <p>(max, 800 X 800px)</p>
            </div>
          </div>

          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
            >
              {isUploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserPhoto;