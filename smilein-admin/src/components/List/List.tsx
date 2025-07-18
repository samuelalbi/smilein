import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorProfilePicture } from '../../api/instructorApi'; // Add this import

interface ProfileCardProps {
  id: number;
  name: string;
  email: string;
  description: React.ReactNode;
  status?: 'Approved' | 'Pending' | 'Active' | 'Inactive';
  dob?: string;
  onDelete?: () => void;
  type: 'student' | 'instructor'; // Determines navigation
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  email,
  description,
  type,
  onDelete
}) => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch profile pictures for instructors
    if (type === 'instructor') {
      fetchProfilePicture();
    }
  }, [id, type]);

  const fetchProfilePicture = async () => {
    try {
      const pictureData = await getInstructorProfilePicture(id);
      if (pictureData && pictureData.profile_picture_url) {
        setProfilePicture(pictureData.profile_picture_url);
      }
    } catch (err) {
      console.log('No profile picture found, using initials');
      // We'll use initials as fallback, so no need to set error
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleClick = () => {
    // Dynamic navigation based on the type prop
    const route = type === 'student'
      ? `/student/student-list/${id}`
      : `/instructor/instructor-list/${id}`;

    navigate(route, {
      state: {
        [`${type}Id`]: id  // Dynamically set studentId or instructorId
      }
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 flex items-start space-x-4 transition-colors duration-200 cursor-pointer hover:shadow-lg"
    >
      {profilePicture ? (
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img 
            src={profilePicture}
            alt={`${name} profile`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-blue-600">
          {getInitials(name)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;