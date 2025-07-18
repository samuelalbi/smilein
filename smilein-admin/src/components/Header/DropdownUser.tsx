import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import UserOne from '../../images/user/user-01.png';
import { jwtDecode } from 'jwt-decode';
import { getAdminByUsername, getAdminProfilePicture } from '../../api/adminApi';
import { getInstructor } from '../../api/instructorApi';
import { AdminRead } from '../../types/admin';
import { InstructorRead } from '../../types/instructor';

interface DecodedToken {
  username?: string;
  sub?: string;
  instructor_id?: number;
  admin_id?: number;
  [key: string]: any;
}

const DropdownUser: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [decodedToken, setDecodedToken] = useState<DecodedToken>({});
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userData, setUserData] = useState<AdminRead | InstructorRead | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setDecodedToken(decoded);
      }
      catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    } else {
      console.log("Token tidak ditemukan di localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token not found in localStorage");
        }

        const decoded = jwtDecode<DecodedToken>(token);
        console.log("Decoded token:", decoded);
        const currentUserType = localStorage.getItem("userType");

        // Handle Admin login
        if (currentUserType === "admin") {
          if (!decoded.sub) {
            throw new Error("Username not found in token");
          }

          const fetchedAdminData = await getAdminByUsername(decoded.sub);
          setUserData(fetchedAdminData);

          // Try to fetch profile picture if we have admin data
          if (fetchedAdminData?.admin_id) {
            try {
              const profileData = await getAdminProfilePicture(fetchedAdminData.admin_id);
              setProfilePicture(profileData.profile_picture_url);
            } catch (profileErr) {
              console.error("Error fetching profile picture:", profileErr);
            }
          }
        }
        // Handle Instructor login
        else if (currentUserType === "instructor") {
          const instructorId = decoded.user_id || parseInt(decoded.sub || "0");
          if (isNaN(instructorId) || instructorId === 0) {
            throw new Error("Invalid instructor ID");
          }

          const fetchedInstructorData = await getInstructor(instructorId);
          setUserData(fetchedInstructorData);

          // Set profile picture if available
          if (fetchedInstructorData.profile_picture_url) {
            setProfilePicture(fetchedInstructorData.profile_picture_url);
          }
        }

        setIsLoading(false);

      } catch (err) {
        console.error('Failed to fetch user data', err);
        setError('Failed to load user information. Please try logging in again.');
        setIsLoading(false);
      }
    };

    if (decodedToken.sub || decodedToken.instructor_id || decodedToken.admin_id) {
      fetchUserData();
    }

  }, [decodedToken]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.reload();
  };

  // Function to process image URL
  const getImageUrl = (url: string | null) => {
    if (!url) return UserOne;

    if (url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `https://web-production-f9b4.up.railway.app${url}`;
    return url;
  };

  // Get display name based on user type
  const getDisplayName = () => {
    if (userType === "admin" && 'username' in (userData || {})) {
      return (userData as AdminRead)?.username || decodedToken.sub || 'Admin';
    } else if (userType === "instructor" && 'name' in (userData || {})) {
      return (userData as InstructorRead)?.full_name || decodedToken.sub || 'Instructor';
    }
    return decodedToken.sub || 'User';
  };

  // Conditionally render based on loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <span className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></span>
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium">Loading...</span>
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {getDisplayName()}
          </span>
          <span className="block text-xs">{userType}</span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <img
            src={getImageUrl(profilePicture)}
            alt="User"
            className="h-full w-full object-cover rounded-full"
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      {dropdownOpen && (
        <div
          className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.8656 8.86874C20.5219 8.49062 20.0406 8.28437 19.525 8.28437H19.4219C19.25 8.28437 19.1125 8.18124 19.0781 8.04374C19.0437 7.90624 18.975 7.80312 18.9406 7.66562C18.8719 7.52812 18.9406 7.39062 19.0437 7.28749L19.1125 7.21874C19.4906 6.87499 19.6969 6.39374 19.6969 5.87812C19.6969 5.36249 19.525 4.88124 19.1469 4.50312L18.0844 3.47499C17.3469 2.77187 16.2062 2.73749 15.4344 3.40624L15.3312 3.47499C15.2281 3.57812 15.0906 3.61249 14.9531 3.57812C14.8156 3.54374 14.7125 3.50937 14.5406 3.47499C14.4031 3.40624 14.3344 3.26874 14.3344 3.13124V2.99374C14.3344 1.91562 13.4625 1.04374 12.3844 1.04374H10.9531C10.4375 1.04374 9.95625 1.24999 9.61875 1.62812C9.28125 2.00624 9.0375 2.52187 9.07188 3.06874V3.13124C9.07188 3.26874 9.00313 3.40624 8.86563 3.47499C8.72813 3.54374 8.62501 3.61249 8.48751 3.64687C8.35001 3.68124 8.21251 3.64687 8.10938 3.54374L8.04063 3.47499C7.67188 3.09687 7.19063 2.89062 6.64063 2.89062C6.09063 2.89062 5.61251 3.09687 5.24376 3.47499L4.18126 4.53749C3.47813 5.24062 3.44376 6.38124 4.11251 7.15312L4.18126 7.25624C4.28438 7.35937 4.31876 7.49687 4.28438 7.63437C4.25001 7.77187 4.21563 7.87499 4.18126 8.04687C4.11251 8.18437 3.97501 8.25312 3.83751 8.25312H3.73438C3.21876 8.25312 2.73751 8.45937 2.36563 8.83749C1.99376 9.21562 1.78751 9.69687 1.78751 10.2125V11.6437C1.78751 12.7219 2.65938 13.5937 3.73438 13.5937H3.83751C3.97501 13.5937 4.11251 13.6625 4.18126 13.8C4.21563 13.9375 4.25001 14.0406 4.28438 14.1781C4.31876 14.3156 4.28438 14.4531 4.18126 14.5562L4.11251 14.625C3.73438 14.9906 3.52813 15.4719 3.52813 15.9875C3.52813 16.5031 3.70001 16.9844 4.07813 17.3625L5.14063 18.425C5.87813 19.1281 7.01876 19.1625 7.79063 18.4937L7.89376 18.425C7.99688 18.3219 8.13438 18.2875 8.27188 18.3219C8.40938 18.3562 8.51251 18.3906 8.68438 18.425C8.82188 18.4937 8.89063 18.6312 8.89063 18.7687V18.9062C8.89063 19.9844 9.76251 20.8562 10.8406 20.8562H12.2719C13.35 20.8562 14.2219 19.9844 14.2219 18.9062V18.8031C14.2219 18.6656 14.2906 18.5281 14.4281 18.4594C14.5656 18.3906 14.6688 18.3562 14.8063 18.3219C14.9438 18.2875 15.0813 18.3219 15.1844 18.425L15.2531 18.4937C15.6219 18.8719 16.1031 19.0781 16.6531 19.0781C17.2031 19.0781 17.6813 18.8719 18.05 18.4937L19.1125 17.4312C19.8156 16.7281 19.85 15.5875 19.1813 14.8156L19.1125 14.7125C19.0094 14.6094 18.975 14.4719 19.0094 14.3344C19.0438 14.1969 19.0781 14.0937 19.1125 13.9219C19.1813 13.7844 19.3188 13.7156 19.4563 13.7156H19.5594H19.6281C20.6719 13.7156 21.5438 12.8437 21.5438 11.7656V10.3344C21.475 9.97187 21.2688 9.28749 20.8656 8.86874ZM11.2781 13.8C9.5875 13.8 8.2 12.4469 8.2 10.7219C8.2 8.99687 9.55313 7.64374 11.2781 7.64374C13.0031 7.64374 14.3563 8.99687 14.3563 10.7219C14.3563 12.4469 12.9687 13.8 11.2781 13.8Z"
                    fill=""
                  />
                </svg>
                Account Settings
              </Link>
            </li>
          </ul>
          <button
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            onClick={handleLogout}
          >
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
                fill=""
              />
              <path
                d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
                fill=""
              />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;