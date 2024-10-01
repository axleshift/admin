import React from 'react';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';
import { useGetUserQuery } from '../state/api';
import { useSelector } from 'react-redux';

const DefaultLayout = () => {
  const userId = useSelector((state) => state.changeState.userId);
  const { data, isLoading, error } = userId ? useGetUserQuery(userId) : { data: null, isLoading: false, error: null };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching user:', error);
    return <div>An error occurred: {error.status}: {JSON.stringify(error.data)}</div>; // Show status and error data
  }

  return (
    <div>
      <AppSidebar user={data || {}} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

export default DefaultLayout;
