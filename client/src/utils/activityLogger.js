import axiosInstance from './axiosInstance';

const logActivity = async ({ name, role, department, route, action, description }) => {
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

export default logActivity;
