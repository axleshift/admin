import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

const EmailVerification = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/client/verify-email', { userId, otp });
      
      if (response.data.success) {
        setSuccess(response.data.message);
        setIsVerified(true);
        setUserEmail(response.data.email);
        // After verification, you could display the email credentials or redirect
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/client/resend-verification', { userId });
      
      if (response.data.success) {
        setSuccess('New verification code sent to your email');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend verification code');
    }
  };

  return (
    <div className="verification-container">
      <h2>Email Verification</h2>
      
      {isVerified ? (
        <div className="verification-success">
          <h3>Email Verified Successfully!</h3>
          <p>Your email {userEmail} has been verified.</p>
          <p>You can now use your account credentials to log in.</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Proceed to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify}>
          <p>Please enter the verification code sent to your email:</p>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="otp-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="button-container">
            <button type="submit" className="btn-primary">
              Verify Email
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              className="btn-secondary"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailVerification;