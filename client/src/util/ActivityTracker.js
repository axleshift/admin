import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ActivityTracker = ({ path, action, description }) => {
  const accessToken = localStorage.getItem('accessToken');
  const location = useLocation();

  useEffect(() => {
    const route = path || location.pathname;
    const activityAction = action || 'Page Navigation';
    const activityDescription = description || `User navigated to ${route}`;

    if (!route) return;

    const trackActivity = async () => {
      try {
        const cleanedRoute = route.split("?")[0]; // Remove query parameters if any.
        await axios.post(
          'http://localhost:5053/try/logs/activity',
          {
            route: cleanedRoute, // Send the cleaned route
            action: activityAction,
            description: activityDescription,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          }
        );

      } catch (error) {
        console.error('❌ Error tracking activity:', error);
      }
    };

    if (accessToken) trackActivity();
  }, [location, path, action, description, accessToken]);

  return null;
};

export default ActivityTracker;