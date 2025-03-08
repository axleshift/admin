import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import Page500 from '../views/pages/page500/Page500'; // Adjust the path as needed

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const location = useLocation();
  
  // If not logged in, redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, check page-specific permissions
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
  
  // Extract the current path to check permissions
  const currentPath = location.pathname;

  // Function to check if user has access to this route
  const hasAccess = () => {
    // If the user has the specific permission for this path in their permissions array
    if (userPermissions.includes(currentPath)) {
      return true;
    }

    // Check against the access permissions defined in _nav.js
    const accessPermissions = {
      superadmin: {
        HR: [
          '/employeedash',
          '/hrdash',
          '/financedash',
          '/coredash',
          '/logisticdash',
          '/worker',
          '/jobposting',
          '/payroll',
          '/freight/transaction',
          '/oversales',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/useractivity/index',
          '/announce',
          '/restore',
          '/tack',
          '/recovery',
          '/Toasts',
          '/chatbox',
          '/invoice',
          '/registernew',
          '/PendingRequest',
          '/AccessReview',
          '/freightaudit',
          '/financialanalytics',
          '/shipment',
          '/logistic1/index',
          '/logistic1/pin',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Core: [
          '/employeedash',
          '/hrdash',
          '/financedash',
          '/coredash',
          '/logisticdash',
          '/worker',
          '/jobposting',
          '/payroll',
          '/freight/transaction',
          '/oversales',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/useractivity/index',
          '/announce',
          '/restore',
          '/tack',
          '/recovery',
          '/Toasts',
          '/chatbox',
          '/shipment',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Logistic: [
          '/employeedash',
          '/hrdash',
          '/financedash',
          '/coredash',
          '/logisticdash',
          '/worker',
          '/jobposting',
          '/payroll',
          '/freight/transaction',
          '/oversales',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/useractivity/index',
          '/announce',
          '/restore',
          '/tack',
          '/recovery',
          '/Toasts',
          '/chatbox',
          '/logistic1/index',
          '/logistic1/pin',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Finance: [
          '/employeedash',
          '/hrdash',
          '/financedash',
          '/coredash',
          '/logisticdash',
          '/worker',
          '/jobposting',
          '/payroll',
          '/freight/transaction',
          '/oversales',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/useractivity/index',
          '/announce',
          '/restore',
          '/tack',
          '/recovery',
          '/Toasts',
          '/chatbox',
          '/freightaudit',
          '/financialanalytics',
          '/invoice',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Administrative: [
          '/employeedash',
          '/hrdash',
          '/financedash',
          '/coredash',
          '/logisticdash',
          '/worker',
          '/jobposting',
          '/payroll',
          '/freight/transaction',
          '/oversales',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/useractivity/index',
          '/announce',
          '/restore',
          '/tack',
          '/recovery',
          '/Toasts',
          '/chatbox',
          '/recoverytuts',
          '/registernew',
          '/PendingRequest',
          '/AccessReview',
          '/monitoring',
          '/profile',
          '/Settings',
          '/changepass',
          '/freightaudit',
          '/financialanalytics',
          '/invoice',
          '/shipment',
          '/settings',
          '/request',
          '/logistic1/index'
        ]
      },
      admin: {
        HR: [
          '/hrdash',
          '/worker',
          '/jobposting',
          '/payroll',,
          '/profile',
          '/Settings',
          '/changepass',
          '/request',
        ],
        Core: [
          '/coredash',
          '/shipment',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Finance: [
          '/financedash',
          '/freight/transaction',
          '/oversales',
          '/freightaudit',
          '/financialanalytics',
          '/invoice',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Logistics: [
          '/logisticdash',
          '/shipment',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/logistic1/index',
          '/logistic1/pin',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Administrative: [
          '/employeedash',
          '/useractivity/index',
          '/restore',
          '/registernew',
          '/PendingRequest',
          '/AccessReview',
          '/profile',
          '/Settings',
          '/changepass'
        ]
      },
      Manager: {
        HR: [
          '/hrdash',
          '/worker',
          '/jobposting',,
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Core: [
          '/coredash',
          '/customer',
          '/monthly',
          '/daily',
          '/breakdown',
          '/shipment',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Finance: [
          '/financedash',
          '/freight/transaction',
          '/oversales',
          '/freightaudit',
          '/financialanalytics',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Logistic: [
          '/logisticdash',
          '/logistic1/index',
          '/logistic1/pin',
          '/profile',
          '/Settings',
          '/changepass'
        ],
        Administrative: [
          '/employeedash',
          '/useractivity/index',
          '/profile',
          '/Settings',
          '/changepass'
        ]
      }
    };

    // Always permit access to profile-related pages
    const alwaysPermitted = [
      '/profile',
      '/Settings',
      '/changepass'
    ];

    if (alwaysPermitted.includes(currentPath)) {
      return true;
    }

    // Check if user's role and department have access to this path
    return accessPermissions[userRole]?.[userDepartment]?.includes(currentPath) || false;
  };

  // If user doesn't have permission for this page, show 500 error
  if (!hasAccess()) {
    console.log(`⛔ Access denied to ${currentPath} for ${userRole}/${userDepartment}`);
    return <Page500 />;
  }

  // User is authenticated and has permission, render the component
  return children;
};

// Define PropTypes for validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // Ensures children is a valid React node
};

export default ProtectedRoute;