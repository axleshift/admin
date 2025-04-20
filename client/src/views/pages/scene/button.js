import React, { useState } from 'react';
import { CButton, CToast, CToastHeader, CToastBody, CToaster } from '@coreui/react';
import logActivity from '../../../utils/activityLogger';
import axiosInstance from '../../../utils/axiosInstance';

const ExampleButtonPage = () => {
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userEmail = localStorage.getItem('email');
  const userUsername = localStorage.getItem('username'); 
  const userId = localStorage.getItem('userId');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const userName = localStorage.getItem('name'); 
  
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipient) {
      setStatus({
        success: false,
        message: 'Please enter a recipient email address'
      });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    
    try {
      const response = await axiosInstance.post('/management/emailsent', { recipient });
      
      setStatus({
        success: true,
        message: 'Email sent successfully!'
      });
    } catch (error) {
      setStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to send email'
      });
    } finally {
      setLoading(false);
    }
  };
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


      <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Send Hello Email</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Recipient Email:</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Hello Email'}
            </button>
          </form>
          
          {status && (
            <div className={`alert mt-3 ${status.success ? 'alert-success' : 'alert-danger'}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ExampleButtonPage;