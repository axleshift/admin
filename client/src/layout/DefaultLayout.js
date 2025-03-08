import React, { useEffect, useState } from 'react';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';
import { Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary'; // Import ErrorBoundary

const DefaultLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userId = sessionStorage.getItem('userid');
      const accessToken = localStorage.getItem('accessToken');
      const role = sessionStorage.getItem('role');
      const department = sessionStorage.getItem('department');
      
      console.log('DefaultLayout Auth Check:', {
        userId,
        hasAccessToken: !!accessToken,
        role,
        department
      });
      
      if (userId && accessToken) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Add an empty dependency array to run this effect only once

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;