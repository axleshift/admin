import nodemailer from 'nodemailer';

// Use a test email service like Ethereal or Mailtrap for easier testing
// Alternatively, use a more straightforward Gmail config
const createTransporter = () => {
  // Option 1: Gmail with explicit settings
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.trim() // Make sure to trim any extra spaces
    },
    debug: true // This will output additional debug info
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


export const verifyTransporter = async (transporter) => {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error("Email server configuration error:", error);
        reject(error);
      } else {
        resolve(success);
      }
    });
  });
};


export const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    await verifyTransporter(transporter);
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

