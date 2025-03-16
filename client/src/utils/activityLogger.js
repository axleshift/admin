import axiosInstance from './axiosInstance';

export const logActivity = async ({ name, role, department, route, action, description }) => {
    console.log('Activity logged:', activityData);
    try {
        await axiosInstance.post('/general/log', {
            name,
            role,
            department,
            route,
            action,
            description
        });
    } catch (error) {
        console.error('Failed to log activity:', error.message);
    }
};

    