import EmployeeComplaint from "../model/employeeComplaint.js";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import createTransporter from "../services/emailService.js";

export const sendEmployeeComplaint = async (req, res, next) => {
    try {
        const { email } = req.body;

        // If no email is provided, just proceed to next middleware (auth)
        if (!email) {
            return next();
        }
        
        // Find user by email
        const user = await User.findOne({ email });

        // If no user found, proceed to authentication
        if (!user) {
            return next();
        }   

        // Check if user already has an accepted complaint
        const complaint = await EmployeeComplaint.findOne({
            userId: user._id
        });

        if (complaint && complaint.status === 'accepted') {
            // User already has an accepted complaint, proceed to next middleware
            return next();
        }
        
        // Generate JWT token for complaint link
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        const sendComplaintUrl = `${process.env.CLIENT_URL}/employeesExternalComplain/${user._id}/${token}`;
        console.log("Complaint link:", sendComplaintUrl);

        // Create email transporter
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"Account Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Employee Complaint",
            text: `Your complaint link is: ${sendComplaintUrl}. This link expires in 1 day.`,
            html: `<p>Your complaint link is: <strong>${sendComplaintUrl}</strong>.</p><p>This link expires in 1 day.</p>`
        };

        // Send email without waiting for response
        transporter.sendMail(mailOptions)
            .then(info => {
                console.log("Complaint link sent successfully:", info.messageId);
            })
            .catch(error => {
                console.error("Error sending complaint link:", error);
            });
        
        // Always proceed to the next middleware (externaltest)
        return next();
    } catch (error) {
        console.error("Error in sendEmployeeComplaint middleware:", error);
        // If there's an error, still proceed to authentication rather than stopping the flow
        return next();
    }
}