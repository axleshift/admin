import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Middleware to verify OAuth Token and restrict access based on department
export const verifyTokenAndDepartment = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request

        // Extract department from the URL (e.g., /employee/hr → "hr")
        const requestedDepartment = req.params.department.toLowerCase();

        // Ensure the user's department matches the requested department
        if (decoded.department.toLowerCase() !== requestedDepartment) {
            return res.status(403).json({ message: "Access denied: Unauthorized department" });
        }

        next(); // User is authorized, proceed with request
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
