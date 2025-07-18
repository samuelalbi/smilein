import React from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Notification: React.FC = () => {
  // This would typically come from a prop or API
  const notifications: Notification[] = [];
  
  return (
    <div className="mt-6 p-4 md:p-6 border dark:border-gray-700 rounded-lg dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Notification</h2>
      
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900'}`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium dark:text-white">{notification.title}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{notification.date}</span>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{notification.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Notification responses will be displayed here.</p>
      )}
    </div>
  );
};

export default Notification;