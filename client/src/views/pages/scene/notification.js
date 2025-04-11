import React, { useEffect, useState } from "react";
import socket from "../../../utils/socket"; 
import { CToast, CToastHeader, CToastBody, CToaster } from "@coreui/react";
import axios from "axios";
import PropTypes from 'prop-types';

const NotificationToast = ({ userId }) => {
  const [toasts, setToasts] = useState([]);
  
  // Load notifications from the database on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const endpoint = userId 
          ? `${import.meta.env.VITE_APP_BASE_URL}/notifications/user/${userId}`
          : `${import.meta.env.VITE_APP_BASE_URL}/notifications/getnotif`;
          
        const { data } = await axios.get(endpoint, { withCredentials: true });
        
        if (data.success) {
          // Convert DB notifications to toast components
          const dbToasts = data.data.map(notification => createToastFromNotification(notification));
          setToasts(dbToasts);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
  }, [userId]);

  // Helper function to create toast component from notification data
  const createToastFromNotification = (notification) => {
    // Determine color based on notification type
    let color = "#007aff"; // Default blue
    if (notification.type === "permission_update") color = "#28a745"; // Green
    if (notification.type === "permission_revoke") color = "#ff0000"; // Red
    if (notification.type === "request_status" && notification.message.includes("denied")) color = "#ff0000";
    
    return (
      <CToast 
        autohide={true}
        delay={3000 + Math.random() * 2000} // Stagger toasts closing
        visible={true} 
        key={notification._id}
        onClose={() => markNotificationAsRead(notification._id)}
      >
        <CToastHeader closeButton>
          <svg
            className="rounded me-2"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            role="img"
          >
            <rect width="100%" height="100%" fill={color}></rect>
          </svg>
          <strong className="me-auto">{notification.title}</strong>
          <small>{new Date(notification.createdAt).toLocaleTimeString()}</small>
        </CToastHeader>
        <CToastBody>
          {notification.message}
        </CToastBody>
      </CToast>
    );
  };
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_BASE_URL}/notifications/read/${notificationId}`,
        {},
        { withCredentials: true }
      );
      
      // Log success
      if (response.status === 200) {
        console.log(`Notification ${notificationId} marked as read`);
      }
    } catch (error) {
      // Don't keep retrying if the notification wasn't found
      if (error.response && error.response.status === 404) {
        console.log(`Notification ${notificationId} no longer exists`);
        return;
      }
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    // Socket event handlers for real-time notifications
    const handleNewUserRegistered = (data) => {
      const newToast = (
        <CToast autohide={true} visible={true} key={`reg-${data.user.id}`}>
          <CToastHeader closeButton>
            <svg
              className="rounded me-2"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              role="img"
            >
              <rect width="100%" height="100%" fill="#007aff"></rect>
            </svg>
            <strong className="me-auto">New Registration</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            <strong>{data.user.name}</strong> has registered as {data.user.role}.
          </CToastBody>
        </CToast>
      );
      
      setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const handlePermissionUpdated = (data) => {
      // Only show this toast if it's relevant to the current user
      // or if no specific userId is provided (show all notifications)
      if (!userId || userId === data.name) {
        const newToast = (
          <CToast autohide={true} visible={true} key={`perm-${Date.now()}`}>
            <CToastHeader closeButton>
              <svg
                className="rounded me-2"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
                role="img"
              >
                <rect width="100%" height="100%" fill="#28a745"></rect>
              </svg>
              <strong className="me-auto">Permission Granted</strong>
              <small>Just now</small>
            </CToastHeader>
            <CToastBody>
              User <strong>{data.grantedBy}</strong> granted access to user <strong>{data.name}</strong> for the following permissions:
              <br />
              <ul>
                {data.permissions.map((perm) => (
                  <li key={perm}>{perm}</li>
                ))}
              </ul>
            </CToastBody>
          </CToast>
        );
        
        setToasts((prevToasts) => [...prevToasts, newToast]);
      }
    };

    const handlePermissionRevoked = (data) => {
      if (!userId || userId === data.name) {
        const newToast = (
          <CToast autohide={true} visible={true} key={`revoke-${Date.now()}`}>
            <CToastHeader closeButton>
              <svg
                className="rounded me-2"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
                role="img"
              >
                <rect width="100%" height="100%" fill="#ff0000"></rect>
              </svg>
              <strong className="me-auto">Permission Revoked</strong>
              <small>Just now</small>
            </CToastHeader>
            <CToastBody>
              Permissions <strong>{data.revokedPermissions.join(", ")}</strong> were revoked for user <strong>{data.name}</strong>.
            </CToastBody>
          </CToast>
        );
        
        setToasts((prevToasts) => [...prevToasts, newToast]);
      }
    };

    const handleRequestStatusUpdate = (data) => {
      if (!userId || userId === data.userId) {
        const { status, messageId, respondedBy, pageName } = data;
        const statusText = status === "accepted" ? "granted" : "denied";
        const color = status === "accepted" ? "#28a745" : "#ff0000";

        const newToast = (
          <CToast autohide={true} visible={true} key={`status-${messageId}`}>
            <CToastHeader closeButton>
              <svg
                className="rounded me-2"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
                role="img"
              >
                <rect width="100%" height="100%" fill={color}></rect>
              </svg>
              <strong className="me-auto">Request Status</strong>
              <small>Just now</small>
            </CToastHeader>
            <CToastBody>
              Your access request for <strong>{pageName}</strong> was <strong>{statusText}</strong> by <strong>{respondedBy}</strong>.
            </CToastBody>
          </CToast>
        );
        
        setToasts((prevToasts) => [...prevToasts, newToast]);
      }
    };

    // Generic notification handler for notifications from the server
    const handleNotification = (notification) => {
      // Only show if relevant to this user or if it's a broadcast notification
      if (!userId || !notification.userId || userId === notification.userId) {
        const toast = createToastFromNotification(notification);
        setToasts((prevToasts) => [...prevToasts, toast]);
      }
    };

    // Register socket event listeners
    socket.on("newUserRegistered", handleNewUserRegistered);
    socket.on("permissionUpdated", handlePermissionUpdated);
    socket.on("permissionRevoked", handlePermissionRevoked);
    socket.on("requestStatusUpdate", handleRequestStatusUpdate);
    socket.on("notification", handleNotification);

    // Cleanup function
    return () => {
      socket.off("newUserRegistered", handleNewUserRegistered);
      socket.off("permissionUpdated", handlePermissionUpdated);
      socket.off("permissionRevoked", handlePermissionRevoked);
      socket.off("requestStatusUpdate", handleRequestStatusUpdate);
      socket.off("notification", handleNotification);
    };
  }, [userId]); 

  return <CToaster placement="top-end">{toasts}</CToaster>; 
};

NotificationToast.propTypes = {
  userId: PropTypes.string,
};

export default NotificationToast;