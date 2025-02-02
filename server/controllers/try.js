import Log from '../model/Log.js';

// Create a new log
export const createLog = async (user, action, description, route ) => {
    try {
        const newLog = new Log({
            username: user.username,
            name: user.name,
            department: user.department,
            role: user.role,
            action,
            description,
            route, // Ensure route is always provided
        });
        await newLog.save();
    } catch (error) {
        console.error('Error creating log:', error);
    }
};


// Log user route visits
export const logRouteVisit = async (req, res, next) => {
    if (req.session.user) {
        const { username, name, department, role } = req.session.user;
        const route = req.originalUrl; // Get the route the user is visiting
        const description = `User visited ${route}`;

        try {
            await createLog({ username, name, department, role }, 'Route Visit', description);
        } catch (error) {
            console.error('Error logging route visit:', error);
        }
    }
    next(); // Continue to the next middleware or route handler
};

// Fetch all logs
export const getLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }); // Sort by latest first
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logFrontendActivity = async (req, res) => {
    try {
        const user = req.session.user; // Get user session

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: No user session found" });
        }

        const { route, action, description } = req.body; // Get frontend data

        if (!route || !action || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Log activity
        await Log.create({
            username: user.username,
            name: user.name,
            department: user.department,
            role: user.role,
            route,        // Store the route from frontend
            action,       // Store the action from frontend
            description,  // Store the description from frontend
            timestamp: new Date()
        });

        res.status(200).json({ message: "Activity logged successfully" });
    } catch (error) {
        console.error("❌ Error logging activity:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


