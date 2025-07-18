import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import PersonalInformation from '../components/Profile/PersonalInformation';
import UserPhoto from '../components/Profile/UserPhoto';
import ChangePassword from '../components/Profile/ChangePassword';
import { getAdmin } from '../api/adminApi';
import { getInstructor } from '../api/instructorApi';
import { AdminRead } from '../types/admin';
import { InstructorRead } from '../types/instructor';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub?: string;
  user_type?: string;
  exp?: number;
  user_id?: number;
  instructor_id?: number;
  admin_id?: number;
}

// Create an adapter function to convert InstructorRead to AdminRead format and preserve the nidn field
const instructorToAdminFormat = (instructor: InstructorRead): AdminRead & { nidn?: string } => {
  return {
    admin_id: instructor.instructor_id,
    full_name: instructor.full_name,
    username: instructor.username,
    email: instructor.email,
    phone_number: instructor.phone_number,
    profile_picture_url: instructor.profile_picture_url,
    is_active: instructor.is_active,
    created_at: instructor.created_at,
    updated_at: instructor.updated_at,
    password: '', // This is required by AdminRead but not used for display
    nidn: instructor.nidn // Add the NIDN field so it's available in the converted data
  };
};

const Settings: React.FC = () => {
  const [userData, setUserData] = useState<AdminRead | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found in localStorage");
        }

        // Get user type
        const storedUserType = localStorage.getItem("userType");
        setUserType(storedUserType);

        // Decode the token 
        const decoded = jwtDecode<DecodedToken>(token);
        console.log("Decoded token:", decoded);

        // Handle based on user type
        if (storedUserType === "admin") {
          // Fetch admin data
          const userId = decoded.user_id || decoded.admin_id;
          if (!userId) {
            throw new Error("Admin ID not found in token");
          }

          const fetchedAdminData = await getAdmin(userId);
          setUserData(fetchedAdminData);
        }
        else if (storedUserType === "instructor") {
          // Fetch instructor data
          const instructorId = decoded.instructor_id || decoded.user_id;
          if (!instructorId) {
            throw new Error("Instructor ID not found in token");
          }

          const fetchedInstructorData = await getInstructor(instructorId);
          // Convert instructor data to admin format to work with the PersonalInformation component
          setUserData(instructorToAdminFormat(fetchedInstructorData));
        }
        else {
          throw new Error("Unknown user type");
        }

        setIsLoading(false);

      } catch (err) {
        console.error('Failed to fetch user data', err);
        setError('Failed to load user information. Please try logging in again.');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to get user ID based on type
  const getUserId = () => {
    return userData?.admin_id;
  };

  // Helper function to get profile picture
  const getProfilePicture = () => {
    return userData?.profile_picture_url;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <PersonalInformation
              initialData={userData}
              userType={userType}
            />

            {/* Add the ChangePassword component below PersonalInformation */}
            <div className="mt-8">
              <ChangePassword
                userId={getUserId()}
                userType={userType}
              />
            </div>
          </div>

          <div className="col-span-5 xl:col-span-2">
            <UserPhoto
              userId={getUserId()}
              userType={userType}
              currentProfilePicture={getProfilePicture()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;