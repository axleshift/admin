import React from 'react';
import { CButton } from '@coreui/react';
import logActivity from '../../../utils/ActivityLogger';

const ExampleButtonPage = () => {
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userUsername = sessionStorage.getItem('username'); 
  const userId = sessionStorage.getItem('userId');
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
  const userName = sessionStorage.getItem('name'); // Make sure you're storing 'name' in the session storage

  const handleButtonClick = () => {
    if (!userId || !userName || !userRole || !userDepartment) {
      console.error("User information is missing. Please make sure it's properly fetched and stored in sessionStorage.");
      return;
    }

    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/button',
      action: 'Button Click',
      description: 'User clicked the button'
    });
  }

  if (!userName) { 
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>Hi {userName}</h1>
      <CButton onClick={handleButtonClick}>Click me</CButton>
    </div>
  );
};

export default ExampleButtonPage;
