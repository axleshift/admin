import Agreement from "../model/Agreement.js";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const checkUserTermsAcceptance = async (req, res, next) => {
  try {
    // Get the user email from the request body
    const { email } = req.body;
    
    if (!email) {
      // If there's no email in the request, proceed
      return next();
    }

    // Find the user by email to get their ID
    const user = await User.findOne({ email });
    
    if (!user) {
      // If user doesn't exist, proceed
      return next();
    }
    
    // Check if the user has an agreement record
    const agreement = await Agreement.findOne({ 
      userId: user._id
    });
    
    // Only proceed if the agreement is accepted
    if (agreement && agreement.status === 'accepted') {
      return next();
    }
    
    // If we get here, we need to send an email because the user either
    // doesn't have an agreement or has rejected it
    
    // Create JWT token with user ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    
    // Generate acceptance link - FIXED TO MATCH ROUTE PATH
    // Make sure to use the user ID correctly in the URL
    const acceptTermsUrl = `${process.env.CLIENT_URL}/termsaccept/${user._id}/${token}`;
    console.log("Terms acceptance link:", acceptTermsUrl);
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    // Setup email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Terms and Conditions Acceptance Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Terms and Conditions Acceptance Required</h2>
          <p>Hello ${user.name || 'Valued User'},</p>
          <p>Thank you for using our application. Before you can continue using all features, 
             we need you to review and accept our Terms and Conditions.</p>
          <p>${!agreement ? 'Your account requires this action before you can proceed with using our services.' : 
             'We noticed you previously declined our Terms and Conditions. To use our services, please review and accept them.'}</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${acceptTermsUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Review and Accept Terms
            </a>
          </div>
          <p>If you cannot click the button above, please copy and paste this URL into your browser:</p>
          <p>${acceptTermsUrl}</p>
          <p>If you have any questions about our Terms and Conditions, please contact our support team.</p>
          <p>Best regards,<br>Your Company Team</p>
        </div>
      `
    };
    
    // Send email using Promise-based approach
    try {
      await transporter.sendMail(mailOptions);
      console.log("Terms acceptance email sent to:", email);
    } catch (emailError) {
      console.error("Error sending terms acceptance email:", emailError);
      // We'll still return the terms required response, but log the email error
    }
    
    // Return appropriate status
    return res.status(403).json({ 
      success: false,
      error: agreement ? "Terms and Conditions were previously rejected" : "Terms and Conditions not acknowledged", 
      message: "Please check your email for the terms and conditions acceptance request.",
      requiresAgreement: true,
      userEmail: email,
    });
    
  } catch (error) {
    console.error("Agreement check error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Server error during agreement verification",
      message: "An unexpected error occurred while checking your terms acceptance status."
    });
  }
};