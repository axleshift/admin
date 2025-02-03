import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleNewUserRegistered = (data) => {
      const newNotification = {
        id: Date.now(), // Unique ID for each notification
         message: `${data.user.name} has registered as ${data.user.role}.`
      };

      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]); // Add to the beginning
      toast.success(newNotification.message); // Show the toast

      // Optionally limit the number of notifications stored:
      setNotifications(prevNotifications => prevNotifications.slice(0, 10)); // Keep only the 10 most recent
    };

    socket.on("newUserRegistered", handleNewUserRegistered);

    return () => {
      socket.off("newUserRegistered", handleNewUserRegistered);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className="notification-icon" onClick={toggleDropdown}>
        {/* Your notification icon here (e.g., a bell) */}
        <span className="badge bg-danger">{notifications.length}</span> {/* Notification count */}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No new notifications.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                {notification.message}
              </div>
            ))
          )}
        </div>
      )}

      <ToastContainer position="top-end" autoClose={5000} />
    </div>
  );
};

export default NotificationDropdown;