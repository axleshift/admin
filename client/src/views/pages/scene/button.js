import React, { useState } from 'react';
import { CButton, CToast, CToastHeader, CToastBody, CToaster } from '@coreui/react';
import logActivity from '../../../utils/activityLogger';

const ExampleButtonPage = () => {
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username'); 
  const userId = localStorage.getItem('userId');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const userName = localStorage.getItem('name'); 
  
  // State to manage toasts
  const [toasts, setToasts] = useState([]);

  const handleButtonClick = async () => {
    // Show notification and save it to MongoDB in one step
    try {
      const displayName = userName || "User";
      const displayRole = userRole || "Unknown Role";
      const title = "Button Clicked";
      const message = `${displayName} (${displayRole}) has clicked the button successfully.`;
      
      // Use notification service to save and emit the notification
      await notificationService.notify({
        title,
        message,
        type: 'button_click',
        userId
      });
      
      // Show toast in UI
      showToast(title, message);
      
      // Log activity
      if (userId && userName && userRole && userDepartment) {
        logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: '/button',
          action: 'Button Click',
          description: 'User clicked the button'
        }).catch(console.warn);
      }
    } catch (error) {
      console.warn("Error showing notification:", error);
      
      // Still show toast even if saving failed
      showToast("Button Clicked", 
        `${userName || "User"} (${userRole || "Unknown Role"}) has clicked the button successfully.`);
    }
  };

  // Function to show toast UI only
  const showToast = (title, message) => {
    const currentTime = new Date().toLocaleTimeString();
    
    setToasts((prevToasts) => [
      ...prevToasts,
      <CToast autohide={true} visible={true} delay={5000} key={`click-${Date.now()}`}>
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
          <strong className="me-auto">{title}</strong>
          <small>{currentTime}</small>
        </CToastHeader>
        <CToastBody>
          {message}
        </CToastBody>
      </CToast>,
    ]);
  };

  return (
    <div>
      <h1>Hi {userName || "there"}</h1>
      <CButton 
        onClick={handleButtonClick}
        color="primary"
      >
        Click me
      </CButton>
      
      {/* Toast container */}
      <CToaster placement="top-end">
        {toasts}
      </CToaster>
    </div>
  );
};

export default ExampleButtonPage;