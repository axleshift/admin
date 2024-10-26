import Employee from "../model/hr1.js";

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};// Add to your controller.js
export const getPerformanceReport = async (req, res) => {
    try {
        const employees = await Employee.find();
        const report = employees.map(employee => {
            const totalRatings = employee.performance.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRatings / (employee.performance.length || 1); // Avoid division by zero
            return {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                averageRating: averageRating.toFixed(2), // Fixed to 2 decimal places
                totalReviews: employee.performance.length,
            };
        });
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAttendanceReport = async (req, res) => {
    try {
        const employees = await Employee.find();
        const report = employees.map(employee => {
            const totalDays = employee.attendance.length;
            const presentDays = employee.attendance.filter(entry => entry.status === 'present').length;
            const attendanceRate = (presentDays / totalDays * 100).toFixed(2); // Convert to percentage
            return {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                attendanceRate: `${attendanceRate}%`,
                totalDays: totalDays,
                presentDays: presentDays,
            };
        });
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
