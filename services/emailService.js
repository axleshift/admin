import nodemailer from 'nodemailer';

// Use a test email service like Ethereal or Mailtrap for easier testing
// Alternatively, use a more straightforward Gmail config
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", // Default to Gmail
    port: process.env.SMTP_PORT || 587, // Default to TLS port
    secure: process.env.SMTP_PORT === "465", // Use SSL for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.trim(), // Ensure no trailing spaces
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    connectionTimeout: 10000, // Increase timeout to 10 seconds
  });
};

export const sendOTPEmail = async (email, otp) => {
  // For debugging - log credentials (safely)
  console.log(`Email config: User: ${process.env.EMAIL_USER}, Password length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Account Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Account Unlock OTP",
    text: `Your OTP for unlocking your account is: ${otp}. This OTP expires in 10 minutes.`,
    html: `<p>Your OTP for unlocking your account is: <strong>${otp}</strong>.</p><p>This OTP expires in 10 minutes.</p>`
  };

  try {
    // Actually send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error; // CRITICAL: Re-throw to be caught by the calling function
  }
};

export const sendAccountLockedEmail = async (email, lockDuration) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Account Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Account Locked Notification",
    text: `Your account has been locked due to multiple failed login attempts. It will be unlocked automatically after ${lockDuration}.`,
    html: `<p>Your account has been locked due to multiple failed login attempts.</p>
           <p>It will be unlocked automatically after <strong>${lockDuration}</strong>.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Account lock email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending account lock email:", error);
    throw error;
  }
};
