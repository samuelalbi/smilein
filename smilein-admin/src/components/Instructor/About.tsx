import React from 'react';
import { InstructorRead } from '../../types/instructor';

interface AboutProps {
  instructorData: InstructorRead | null;
}

const About: React.FC<AboutProps> = ({ instructorData }) => {
  return (
    <div className="mt-6 grid  gap-4 md:gap-6">
      <div className="border dark:border-gray-700 rounded-lg p-4 md:p-6 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">More Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">NIDN</label>
            <p className="mt-1 dark:text-gray-300">{instructorData?.nidn || 'None'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Nama User</label>
            <p className="mt-1 dark:text-gray-300">{instructorData?.username || 'None'}</p>
          </div>
         
        </div>
      </div>


    </div>
  );
};

export default About;