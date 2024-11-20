import React, { useState } from 'react';
import { useGetNotifQuery } from '../../../state/api';

const NotificationBar = () => {
  const { data: notifications, error, isLoading } = useGetNotifQuery(); // Fetch notifications with RTK Query
  const [showNotifications, setShowNotifications] = useState(false);

  if (isLoading) return <p>Loading notifications...</p>;
  if (error) return <p>Error loading notifications: {error.message}</p>;

  return (
    <div>
      {/* Button to toggle notifications */}
      <button onClick={() => setShowNotifications(!showNotifications)}>
        <i className="bell-icon"></i>
      </button>

      {/* Notifications Container */}
      {showNotifications && (
        <div className="position-relative">
          <div className="toast-container top-0 end-0 p-3">
            {notifications?.data?.map((notification, index) => (
              <div key={index} className="toast show" role="alert">
                <div className="toast-header">
                  <strong className="toast-title">
                    {notification.title || "Notification Title"}
                  </strong>
                  <small className="text-muted">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleTimeString()
                      : "Just now"}
                  </small>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="toast-body">{notification.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
