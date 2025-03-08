import UserActivity from '../model/useractivity';

// Middleware for tracking login
export const trackLogin = async (user, req) => {
  try {
    await UserActivity.logActivity({
      user_id: user._id,
      username: user.username,
      email: user.email,
      action: 'LOGIN',
      description: 'User logged in successfully',
      ip_address: req.ip,
      device_info: req.get('User-Agent'),
      metadata: {
        loginTime: new Date(),
        method: req.method
      }
    });
  } catch (error) {
    console.error('Failed to log login activity:', error);
  }
};

// Middleware for tracking route changes
export const trackRouteChange = async (user, route) => {
  try {
    await UserActivity.logActivity({
      user_id: user._id,
      username: user.username,
      email: user.email,
      action: 'ROUTE_CHANGE',
      route: route,
      description: `Navigated to ${route}`,
      metadata: {
        navigatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log route change:', error);
  }
};

// Middleware for tracking logout
export const trackLogout = async (user, req) => {
  try {
    await UserActivity.logActivity({
      user_id: user._id,
      username: user.username,
      email: user.email,
      action: 'LOGOUT',
      description: 'User logged out',
      ip_address: req.ip,
      device_info: req.get('User-Agent'),
      metadata: {
        logoutTime: new Date(),
        method: req.method
      }
    });
  } catch (error) {
    console.error('Failed to log logout activity:', error);
  }
};