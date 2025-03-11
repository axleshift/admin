import axiosInstance from './axiosInstance.js';

export const trackActivity = async ({ userId, name, role, department, actionType, actionDescription }) => {
  try {
    await axiosInstance.post('/general/log', { 
      userId,
      name,
      role,
      department,
      actionType,
      actionDescription
    }, { withCredentials: true });
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
};
