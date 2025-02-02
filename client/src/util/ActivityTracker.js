import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ActivityTracker = ({ path, action, description }) => {
  const accessToken = localStorage.getItem('accessToken'); // Get user token
  const location = useLocation(); // Automatically get the current page route

  useEffect(() => {
    const route = path || location.pathname; // Use provided path or current route
    const activityAction = action || 'Page Navigation'; // Default action for navigation
    const activityDescription = description || `User navigated to ${route}`; // Default description

    if (!route) return; // Ensure route is provided

    const trackActivity = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5053/try/logs/activity',
          {
            route, // Automatically get the page URL
            action: activityAction, // Describe the action (e.g., "Page Navigation")
            description: activityDescription, // Detailed description
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` }, // Include token
            withCredentials: true, // Ensure cookies are sent
          }
        );

        if (response.status === 200) {
          console.log(
            `✅ Activity logged successfully:\nRoute: ${route}\nAction: ${activityAction}\nDescription: ${activityDescription}`
          );
        } else {
          console.warn(`⚠️ Activity logging failed - Status: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error tracking activity:', error);
      }
    };

    if (accessToken) trackActivity(); // Only track if user is logged in
  }, [location, path, action, description, accessToken]);

  return null;
};

export default ActivityTracker;