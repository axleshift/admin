// filepath: c:\Users\ryans\OneDrive\Desktop\withsecurity\admin - Copy\server\middleware\detectAnomaly.js
import Anomaly from '../model/Anomaly.js';
import LoginAttempt from '../model/LoginAttempt.js';

const detectAnomaly = async (req, res, next) => {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        const recentAttempts = await LoginAttempt.find({ ipAddress }).sort({ timestamp: -1 }).limit(5);

        // Simple anomaly detection logic
        if (recentAttempts.length >= 5) {
            const lastAttempt = recentAttempts[0];
            const timeDiff = new Date() - new Date(lastAttempt.timestamp);

            if (timeDiff < 60000) { // If there are 5 attempts within a minute
                const anomaly = new Anomaly({
                    userId: lastAttempt.userId,
                    ipAddress,
                    userAgent,
                    reason: 'Multiple login attempts in a short period'
                });
                await anomaly.save();
                return res.status(429).json({ message: 'Too many login attempts. Anomaly detected.' });
            }
        }

        next();
    } catch (error) {
        console.error('Anomaly detection error:', error);
        res.status(500).json({ message: 'Server error during anomaly detection' });
    }
};

export default detectAnomaly;