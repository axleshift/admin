import ActivityTracker from '../model/ActivityTracker.js';

export const activityLoggerMiddleware = async (req, res, next) => {
    if (req.user) {
        const { userId, name, role, department } = req.user;
        const { actionType, actionDescription } = req.body;

        try {
            const newActivity = new ActivityTracker({
                userId,
                name,
                role,
                department,
                actionType,
                actionDescription,
            });

            await newActivity.save();
            console.log('✅ Activity logged successfully');
        } catch (error) {
            console.error('❌ Error saving user activity:', error);
        }
    }
    next();
};



