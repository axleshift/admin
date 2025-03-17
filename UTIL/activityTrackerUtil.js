// src/utils/activityTrackerUtil.js
import ActivityTracker from '../models/ActivityTracker.js';

/**
 * Utility class for tracking user activities throughout the application
 */
class ActivityTrackerUtil {
  /**
   * Log a user activity
   * @param {string} userId - User ID
   * @param {string} name - User name
   * @param {string} role - User role
   * @param {string} department - User department
   * @param {string} actionType - Type of action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
   * @param {string} actionDescription - Description of the action
   * @returns {Promise<boolean>} - Success status
   */
  async logActivity(userId, name, role, department, actionType, actionDescription) {
    try {
      if (!userId || !name || !role || !department || !actionType || !actionDescription) {
        console.warn('ActivityTrackerUtil: Missing required parameters');
        return false;
      }
      
      const activity = new ActivityTracker({
        userId,
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
      console.error('Error logging activity:', error);
      return false;
    }
  }
  
  /**
   * Log login activity
   * @param {Object} user - User object
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @param {string} status - Login status
   * @returns {Promise<boolean>} - Success status
   */
  async logLogin(user, ipAddress, userAgent, status = 'success') {
    return this.logActivity(
      user.id || user._id,
      user.name,
      user.role, 
      user.department,
      status === 'success' ? 'LOGIN' : 'LOGIN_FAILED',
      `User ${status === 'success' ? 'logged in' : 'login failed'} | IP: ${ipAddress} | Device: ${userAgent?.substring(0, 100) || 'Unknown'}`
    );
  }
  
  /**
   * Log logout activity
   * @param {Object} user - User object
   * @param {string} ipAddress - IP address
   * @returns {Promise<boolean>} - Success status
   */
  async logLogout(user, ipAddress) {
    return this.logActivity(
      user.id || user._id,
      user.name,
      user.role,
      user.department,
      'LOGOUT',
      `User logged out | IP: ${ipAddress}`
    );
  }
  
  /**
   * Log a resource creation
   * @param {Object} user - User object
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - ID of the resource
   * @returns {Promise<boolean>} - Success status
   */
  async logCreate(user, resourceType, resourceId) {
    return this.logActivity(
      user.id || user._id,
      user.name,
      user.role,
      user.department,
      'CREATE',
      `Created ${resourceType} with ID: ${resourceId}`
    );
  }
  
  /**
   * Log a resource update
   * @param {Object} user - User object
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - ID of the resource
   * @param {Object} changes - Changes made to the resource (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async logUpdate(user, resourceType, resourceId, changes = null) {
    let description = `Updated ${resourceType} with ID: ${resourceId}`;
    
    if (changes) {
      const changesStr = JSON.stringify(changes).substring(0, 200);
      description += ` | Changes: ${changesStr}${changesStr.length > 197 ? '...' : ''}`;
    }
    
    return this.logActivity(
      user.id || user._id,
      user.name,
      user.role,
      user.department,
      'UPDATE',
      description
    );
  }
  
  /**
   * Log a resource deletion
   * @param {Object} user - User object
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - ID of the resource
   * @returns {Promise<boolean>} - Success status
   */
  async logDelete(user, resourceType, resourceId) {
    return this.logActivity(
      user.id || user._id,
      user.name,
      user.role,
      user.department,
      'DELETE',
      `Deleted ${resourceType} with ID: ${resourceId}`
    );
  }
}

export default new ActivityTrackerUtil();