import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedLogin = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const department = sessionStorage.getItem('department');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedLogin;