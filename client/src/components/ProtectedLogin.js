import React from 'react';
import PropTypes from 'prop-types'; // ✅ Import prop-types
import { Navigate } from 'react-router-dom';

const ProtectedLogin = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ✅ Define prop types
ProtectedLogin.propTypes = {
  children: PropTypes.node.isRequired, // Ensures `children` is passed
};

export default ProtectedLogin;
