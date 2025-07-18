import React from 'react';
import { StudentRead } from '../../types/student';


interface AboutProps {
  studentData: StudentRead | null;
}

const About: React.FC<AboutProps> = ({ studentData }) => {
  return (
    <div className="mt-6 grid  gap-4 md:gap-6">
      <div className="border dark:border-gray-700 rounded-lg p-4 md:p-6 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Nama User</label>
            <p className="mt-1 dark:text-gray-300">{studentData?.username || 'None'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Jurusan</label>
            <p className="mt-1 dark:text-gray-300">{studentData?.major_name || 'None'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Tahun Ajaran</label>
            <p className="mt-1 dark:text-gray-300">{studentData?.year || 'None'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
            <p className="mt-1 dark:text-gray-300">
              {studentData?.is_approved ? 'Terverifikasi' : 'Belum Terverifikasi'}
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default About;