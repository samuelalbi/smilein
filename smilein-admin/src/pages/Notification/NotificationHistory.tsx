import { useState } from 'react';
import Swal from 'sweetalert2';
import DynamicTable from '../../components/Tables/DynamicTable';
import { Column } from '../../types/table';

interface Notification {
  id: string;
  title: string;
  content: string;
  recipientType: string;
  priority: 'normal' | 'urgent';
  status: 'delivered' | 'failed';
  timestamp: string;
  recipients: {
    total: number;
    delivered: number;
    failed: number;
  };
}

const HistoryNotification = () => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance',
      content: 'Scheduled maintenance tomorrow at 2 PM',
      recipientType: 'all',
      priority: 'urgent',
      status: 'delivered',
      timestamp: '2025-01-10T14:30:00',
      recipients: {
        total: 150,
        delivered: 148,
        failed: 2
      }
    },
    {
      id: '2',
      title: 'New Feature Release',
      content: 'Check out our latest features!',
      recipientType: 'group',
      priority: 'normal',
      status: 'delivered',
      timestamp: '2025-01-09T10:15:00',
      recipients: {
        total: 75,
        delivered: 75,
        failed: 0
      }
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRecipientTypeLabel = (type: string) => {
    const types = {
      all: 'All Users',
      group: 'User Group',
      single: 'Single User'
    };
    return types[type as keyof typeof types] || type;
  };

  const showNotificationDetails = (notification: Notification) => {
    Swal.fire({
      title: 'Notification Details',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <p class="font-semibold mb-1">Title</p>
            <p>${notification.title}</p>
          </div>
          <div class="mb-4">
            <p class="font-semibold mb-1">Content</p>
            <p>${notification.content}</p>
          </div>
          <div class="mb-4">
            <p class="font-semibold mb-1">Recipients</p>
            <p>${getRecipientTypeLabel(notification.recipientType)}</p>
            <p>Delivered: ${notification.recipients.delivered}/${notification.recipients.total}</p>
          </div>
          <div class="mb-4">
            <p class="font-semibold mb-1">Priority</p>
            <p class="capitalize">${notification.priority}</p>
          </div>
          <div class="mb-4">
            <p class="font-semibold mb-1">Status</p>
            <p class="capitalize">${notification.status}</p>
          </div>
          <div>
            <p class="font-semibold mb-1">Sent At</p>
            <p>${formatDate(notification.timestamp)}</p>
          </div>
        </div>
      `,
      width: '600px',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close',
      customClass: {
        container: 'notification-detail-modal'
      }
    });
  };

  const notificationColumns: Column[] = [
    {
      header: 'Title',
      accessor: 'title',
      minWidth: '200px',
    },
    {
      header: 'Recipients',
      accessor: 'recipients',
      minWidth: '150px',
      cell: (item: Notification) => (
        <div>
          <div className="text-sm">{getRecipientTypeLabel(item.recipientType)}</div>
          <div className="text-xs text-gray-500">
            {item.recipients.delivered}/{item.recipients.total} delivered
          </div>
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      minWidth: '120px',
      cell: (item: Notification) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.priority === 'urgent'
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
          {item.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '100px',
      cell: (item: Notification) => (
        <span className={`text-sm capitalize ${item.status === 'delivered'
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
          }`}>
          {item.status}
        </span>
      ),
    },
    {
      header: 'Sent At',
      accessor: 'timestamp',
      minWidth: '150px',
      cell: (item: Notification) => formatDate(item.timestamp),
    },
  ];

  return (
    <div className="space-y-8 p-4">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notification History</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {/* Implement export */ }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Export Excel
            </button>
            <button
              onClick={() => {/* Implement export */ }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Export PDF
            </button>
          </div>
        </div>

        <DynamicTable
          columns={notificationColumns}
          data={notifications}
          className="shadow-sm"
          searchable={true}
          filterable={true}
          searchFields={['title', 'content', 'recipientType', 'status']}
          renderActions={(notification: Notification) => (
            <div className="flex space-x-2">
              <button
                onClick={() => showNotificationDetails(notification)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default HistoryNotification;