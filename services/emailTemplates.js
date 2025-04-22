export const getPasswordResetTemplate = (resetLink) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        <p>This link will expire in 24 hours.</p>
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
      </div>
    `;
  };

  export const getOTPTemplate = (otp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Account Verification</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email or contact support.</p>
      </div>
    `;
  };