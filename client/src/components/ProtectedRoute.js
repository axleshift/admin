import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import Page500 from '../views/pages/page500/Page500'; 
import { accessPermissions, alwaysPermitted } from '../components/permissionConfig';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const location = useLocation();
  
  // If not logged in, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  // Retrieve role & department from session storage
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');

  // Extract current path
  const currentPath = location.pathname;

  // Function to check if user has access
  const hasAccess = () => {
    // Grant access if user is superadmin
    if (userRole === 'superadmin') {
      return true;
    }

    // Grant access if page is in the always permitted list
    if (alwaysPermitted.includes(currentPath)) {
      return true;
    }

    // Check if user has explicit permission for this route
    if (userPermissions.includes(currentPath)) {
      return true;
    }

    // Check role-based access from config
    const hasRoleAccess = accessPermissions[userRole]?.[userDepartment]?.includes(currentPath) || false;
    
    // Log access attempt for debugging
    console.log(`🔍 Access check for ${currentPath}: ${hasRoleAccess ? '✅ Granted' : '⛔ Denied'}`);
    console.log(`👤 User: ${userRole}/${userDepartment}`);
    console.log(`🚪 Allowed routes:`, accessPermissions[userRole]?.[userDepartment] || []);
    
    return hasRoleAccess;
  };

  // If user doesn't have permission, show 500 error page
  if (!hasAccess()) {
    console.log(`⛔ Access denied to ${currentPath} for ${userRole}/${userDepartment}`);
    return <Page500 />;
  }

  return children;
};

// Define PropTypes for validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;