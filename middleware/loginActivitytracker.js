import Activitytracker from '../model/Activitytracker.js';

const loginActivityLogger = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        if (!identifier) {
            return res.status(400).json({ error: 'Identifier is required for logging.' });
        }

        const logData = {
            name: req.user?.name || identifier,
            role: req.user?.role || 'Unknown',
            department: req.user?.department || 'Unknown',
            route: req.originalUrl,
            action: 'Login Successful',
            description: `Login successful from IP: ${ipAddress}, User-Agent: ${userAgent}`
        };

        console.log(`Logging attempt: Name: ${logData.name}, Role: ${logData.role}, Department: ${logData.department}`);

        const newActivity = new Activitytracker(logData);

        await newActivity.save();

        console.log('Login activity logged successfully.');

        next();
    } catch (error) {
        console.error('Error logging login attempt:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default loginActivityLogger;
