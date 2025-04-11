import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import Page500 from '../views/pages/page500/Page500'; 
import { accessPermissions, alwaysPermitted } from '../components/permissionConfig';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const location = useLocation();
  
  
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  
  const currentPath = location.pathname;

  
  const hasAccess = () => {
    
    if (userRole === 'superadmin') {
      return true;
    }

    
    if (alwaysPermitted.includes(currentPath)) {
      return true;
    }

    
    if (userPermissions.includes(currentPath)) {
      return true;
    }

    
    const hasRoleAccess = accessPermissions[userRole]?.[userDepartment]?.includes(currentPath) || false;
    
    
    console.log(`🔍 Access check for ${currentPath}: ${hasRoleAccess ? '✅ Granted' : '⛔ Denied'}`);
    console.log(`👤 User: ${userRole}/${userDepartment}`);
    console.log(`🚪 Allowed routes:`, accessPermissions[userRole]?.[userDepartment] || []);
    
    return hasRoleAccess;
  };

  
  if (!hasAccess()) {
    console.log(`⛔ Access denied to ${currentPath} for ${userRole}/${userDepartment}`);
    return <Page500 />;
  }

  return children;
};


ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;