// src/middleware/activityTrackerMiddleware.js
import ActivityTracker from '../model/ActivityTracker.js';

/**
 * Middleware to track user login activities
 * This can be used as standalone middleware or as a utility function
 */
export const trackUserLogin = async (userId, name, role, department, ipAddress, userAgent, status = 'success') => {
  try {
    let actionType = 'LOGIN';
    let actionDescription = 'User logged in successfully';
    
    // Handle different login statuses
    if (status !== 'success') {
      actionType = 'LOGIN_FAILED';
      
      if (status === 'unauthorized') {
        actionDescription = 'Failed login attempt to locked account';
      } else if (status === 'user_not_found') {
        actionDescription = 'Failed login attempt with non-existent user';
        // Since we don't have user details for non-existent users
        name = 'Unknown User';
        role = 'None';
        department = 'None';
      } else if (status === 'failed') {
        actionDescription = 'Failed login attempt with incorrect password';
      } else if (status === 'error') {
        actionDescription = 'Login error occurred';
      }
    }
    
    // Add IP and user agent info to the description
    actionDescription += ` | IP: ${ipAddress} | Device: ${userAgent?.substring(0, 100) || 'Unknown'}`;
    
    const activity = new ActivityTracker({
      userId: userId || 'anonymous',
      name,
      role,
      department,
      actionType,
      actionDescription,
      timestamp: new Date()
    });
    
    await activity.save();
    return true;
  } catch (error) {
    console.error('Error tracking user login activity:', error);
    return false;
  }
};

/**
 * Express middleware to track successful logins
 * Can be used with express routes
 */
export const loginActivityMiddleware = async (req, res, next) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override the json method
  res.json = function(data) {
    // Only track successful logins (status 200)
    if (res.statusCode === 200 && data.user) {
      const { id, name, role, department } = data.user;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      // Track the activity asynchronously (don't wait for it)
      trackUserLogin(id, name, role, department, ipAddress, userAgent)
        .catch(err => console.error('Failed to track login activity:', err));
    }
    
    // Call the original json method
    return originalJson.call(this, data);
  };
  
  next();
};