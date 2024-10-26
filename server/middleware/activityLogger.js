import UserActivity from '../model/useractivity.js';

// Middleware to log user activities
export const activityLogger = (req, res, next) => {
    if (req.session.user) {
        const userId = req.session.user.id; 
        const clientUrl = req.get('X-Client-URL'); 
        const timestamp = new Date(); 

        const activity = new UserActivity({
            userId: userId,
            route: clientUrl,
            timestamp: timestamp
        });

        activity.save()
            .then(() => {
                console.log(`Activity logged: User ID: ${userId}, Route: ${clientUrl}, Time: ${timestamp}`);
            })
            .catch(err => console.error('Error saving activity:', err));
    }
    next();
};
