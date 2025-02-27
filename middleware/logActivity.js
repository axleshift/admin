import Log from '../model/Log.js'; // Add this import statement
import jwt from 'jsonwebtoken';
import User from '../model/User.js'; // Ensure User model is imported if needed
export const logActivity = async (req, res, next) => {
    try {
        let user = req.session.user;

        if (!user) {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-password');
                req.session.user = user; // Restore session
            }
        }

        if (user) {
            // Track both the path and the HTTP method (GET, POST, etc.)
            await Log.create({
                username: user.username,
                name: user.name,
                department: user.department,
                role: user.role,
                action: `${req.method} ${req.path}`,
                description: `User performed ${req.method} on ${req.path}`,
                route: req.path, // Include the route in the log
            });
        }

        next();
    } catch (error) {
        console.error('Error logging activity:', error);
        next(); // Continue even if logging fails
    }
};
