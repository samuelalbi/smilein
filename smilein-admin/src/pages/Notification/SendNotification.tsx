import React, { useState } from 'react';

interface NotificationForm {
  recipientType: string;
  selectedUsers?: string[];
  selectedGroup?: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
}

const SendNotification = () => {
  const [formData, setFormData] = useState<NotificationForm>({
    recipientType: '',
    title: '',
    content: '',
    priority: 'normal'
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending notification:', formData);
    // Add your notification sending logic here
  };

  return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notification</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create and send notifications to your users</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Recipients
              </label>
              <select
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg 
                          text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          dark:focus:ring-blue-400 focus:border-transparent"
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                value={formData.recipientType}
              >
                <option value="" className="dark:bg-gray-700">Choose recipient type</option>
                <option value="single" className="dark:bg-gray-700">Single User</option>
                <option value="all" className="dark:bg-gray-700">All Users</option>
                <option value="group" className="dark:bg-gray-700">User Group</option>
              </select>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg 
                          text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Message Content */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message Content
              </label>
              <textarea
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg 
                          text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          dark:focus:ring-blue-400 focus:border-transparent h-40"
                placeholder="Enter your message"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg 
                          text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          dark:focus:ring-blue-400 focus:border-transparent"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'normal' | 'urgent' })}
                value={formData.priority}
              >
                <option value="normal" className="dark:bg-gray-700">Normal</option>
                <option value="urgent" className="dark:bg-gray-700">Urgent</option>
              </select>
            </div>

            {/* Preview Modal */}
            {previewOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-2xl w-full m-4 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preview Notification</h3>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <p className="mt-2 text-gray-900 dark:text-white">{formData.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                      <p className="mt-2 text-gray-900 dark:text-white">{formData.content}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                      <p className="mt-2 text-gray-900 dark:text-white capitalize">{formData.priority}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 
                         dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Preview
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         dark:bg-blue-500 dark:hover:bg-blue-600 font-medium"
              >
                Send Notification
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default SendNotification;