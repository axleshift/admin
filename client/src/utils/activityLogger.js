// utils/logActivity.js
import axiosInstance from '../utils/axiosInstance.js';

const logActivity = async (activityData) => {
  try {
    const { name, role, department, route, action, description } = activityData;
    
    // Validate inputs before sending
    if (!name || !role || !department || !route || !action || !description) {
      console.warn('Missing required activity parameters');
      return {
        fullAnalysis: 'AI analysis unavailable - missing required fields',
        category: 'General activity',
        patterns: 'No unusual patterns detected',
        riskLevel: 'UNKNOWN'
      };
    }
    
    const response = await axiosInstance.post('/general/log', {
      name,
      role,
      department,
      route,
      action,
      description
    });
    
    return response.data.aiAnalysis;
  } catch (error) {
    console.error('Failed to log activity:', error.message);
    return {
      fullAnalysis: 'AI analysis unavailable - network error',
      category: 'General activity',
      patterns: 'No unusual patterns detected',
      riskLevel: 'UNKNOWN'
    };
  }
};

export default logActivity;