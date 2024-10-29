import UserActivity from '../model/useractivity.js';

export const activityLogger = (req, res, next) => {
    if (req.session.user) {
        const clientUrl = req.originalUrl; // Get current route
        const activity = new UserActivity({
            userId: req.session.user.id,
            route: clientUrl,
            timestamp: new Date()
        });

        activity.save()
            .then(() => console.log(`Logged: ${req.session.user.id} accessed ${clientUrl}`))
            .catch(err => console.error('Logging error:', err));
    }
    next();
};
