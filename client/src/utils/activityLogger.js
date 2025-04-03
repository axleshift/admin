// utils/logActivity.js
import axiosInstance from '../utils/axiosInstance.js';

const logActivity = async ({ name, role, department, route, action, description }) => {
  try {
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
    
    // Handle different response formats
    if (response.data?.aiAnalysis) {
      if (typeof response.data.aiAnalysis === 'string') {
        try {
          // Try to parse if it's a JSON string
          return JSON.parse(response.data.aiAnalysis);
        } catch (e) {
          // Return as is if parsing fails
          return {
            fullAnalysis: response.data.aiAnalysis,
            category: 'General activity',
            patterns: 'No unusual patterns detected',
            riskLevel: 'UNKNOWN'
          };
        }
      }
      return response.data.aiAnalysis; // Return the object directly
    }
    
    return {
      fullAnalysis: 'AI analysis unavailable - unexpected response format',
      category: 'General activity',
      patterns: 'No unusual patterns detected',
      riskLevel: 'UNKNOWN'
    };
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