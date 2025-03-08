import React from 'react';
import { Navigate } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const role = sessionStorage.getItem('role');
  const department = sessionStorage.getItem('department');

  console.log('RedirectIfAuthenticated Check:', {
    accessToken: !!accessToken,
    role,
    department
  });

  if (accessToken) {
    // For superadmin, redirect to employeedash regardless of department
    if (role?.toLowerCase() === 'superadmin') {
      return <Navigate to="/employeedash" replace />;
    }

    // For other roles, redirect based on department
    switch (department?.toLowerCase()) {
      case "administrative":
        return <Navigate to="/employeedash" replace />;
      case "hr":
        return <Navigate to="/hrdash" replace />;
      case "core":
        return <Navigate to="/coredash" replace />;
      case "finance":
        return <Navigate to="/financedash" replace />;
      case "logistics":
        return <Navigate to="/logisticdash" replace />;
      default:
        return <Navigate to="/employeedash" replace />;
    }
  }

  return children;
};

export default RedirectIfAuthenticated;