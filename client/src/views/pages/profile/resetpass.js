import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { analyzePasswordWithAI } from '../../../utils/geminiPasswordAnalyzer';

// CoreUI imports
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CContainer,
  CRow,
  CCol,
  CProgress,
  CSpinner,
  CAlert,
  CTooltip,
  CBadge
} from '@coreui/react';

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faKey, 
  faInfoCircle, 
  faRobot, 
  faExclamationTriangle, 
  faCheckCircle, 
  faShieldAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

// Basic password validation function as fallback
const basicPasswordValidation = (password) => {
  let score = 0;
  let strength = 'Very Weak';
  const feedback = [];
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 20;
  }
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters for stronger security');
  
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters for better security');
  
  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Include numbers to strengthen your password');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  else feedback.push('Add special characters (like !@#$%) for maximum security');
  
  // Variety bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars > 8) score += 10;
  else if (uniqueChars > 5) score += 5;
  else feedback.push('Use a greater variety of characters');
  
  // Common patterns/sequences check
  const commonPatterns = [
    '12345', '123456', 'qwerty', 'password', 'admin', 'welcome',
    'abcdef', 'abc123', '111111', '000000'
  ];
  
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(score - 20, 0);
    feedback.push('Avoid common password patterns and sequences');
  }
  
  // Set strength description based on score
  if (score < 30) strength = 'Very Weak';
  else if (score < 50) strength = 'Weak';
  else if (score < 70) strength = 'Moderate';
  else if (score < 85) strength = 'Strong';
  else strength = 'Very Strong';
  
  return {
    score,
    strength,
    feedback,
    explanation: 'Analysis performed using basic password rules.'
  };
};

function ResetPass() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordAnalysis, setPasswordAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecentlyUsed, setIsRecentlyUsed] = useState(false);
  const navigate = useNavigate();
  const { id, token } = useParams();

  // Enhanced debounce function with improved typing handling
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Function to analyze password with fallback
  const analyzePassword = useCallback(async (pass) => {
    if (!pass || pass.length < 4) {
      return null;
    }
    
    setIsAnalyzing(true);
    setAiError(null);
    
    // Use the AI-powered analysis with fallback to basic validation
    if (aiAvailable) {
      try {
        const analysis = await Promise.race([
          analyzePasswordWithAI(pass),
          // Timeout after 3 seconds
          new Promise((_, reject) => setTimeout(() => reject(new Error('Analysis timeout')), 3000))
        ]);
        
        // Reset retry count on success
        setRetryCount(0);
        return analysis;
      } catch (err) {
        console.error('Password analysis error:', err);
        
        // Increment retry count and potentially disable AI
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // After 3 failed attempts, temporarily disable AI analysis
        if (newRetryCount >= 3) {
          setAiAvailable(false);
          setAiError('AI analysis temporarily disabled due to repeated failures');
          
          // Re-enable AI after 30 seconds
          setTimeout(() => {
            setAiAvailable(true);
            setRetryCount(0);
            setAiError(null);
          }, 30000);
        } else {
          setAiError(`Could not analyze password strength (Attempt ${newRetryCount}/3)`);
        }
        
        // Fallback to basic validation
        return basicPasswordValidation(pass);
      }
    } else {
      // AI is disabled, use basic validation
      return basicPasswordValidation(pass);
    }
  }, [aiAvailable, retryCount]);

  // Use memoized analyzePassword with debounce
  const debouncedAnalyzePassword = useCallback(
    debounce(async (pass) => {
      try {
        const analysis = await analyzePassword(pass);
        setPasswordAnalysis(analysis);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500),
    [analyzePassword]
  );

  // Analyze password whenever it changes
  useEffect(() => {
    // Reset the recently used warning when password changes
    setIsRecentlyUsed(false);
    
    if (password) {
      debouncedAnalyzePassword(password);
    } else {
      setPasswordAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [password, debouncedAnalyzePassword]);

  // Check for token expiration on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        await axiosInstance.get(`/general/validate-reset-token/${id}/${token}`);
      } catch (err) {
        setError('This password reset link has expired or is invalid');
      }
    };
    
    validateToken();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsRecentlyUsed(false);
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Ensure we have analysis data
    const analysisData = passwordAnalysis || basicPasswordValidation(password);
    
    // Reject very weak passwords
    if (analysisData.score < 30) {
      setError('Please choose a stronger password');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await axiosInstance.post(`/general/reset-password/${id}/${token}`, {
        password,
        passwordAnalysis: {
          score: analysisData.score,
          strength: analysisData.strength,
          aiPowered: aiAvailable && !aiError
        }
      });

      if (res.data.Status === 'Success') {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.Message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 400) {
        if (err.response?.data?.Code === 'PASSWORD_RECENTLY_USED') {
          setIsRecentlyUsed(true);
          setError('This password was recently used. Please choose a password you haven\'t used within the last 6 months.');
        } else {
          setError(err.response?.data?.Message || 'Invalid password or expired token');
        }
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('An error occurred during password reset. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to determine progress color
  const getProgressColor = (score) => {
    if (!score || score < 30) return 'danger';
    if (score < 50) return 'warning';
    if (score < 70) return 'info';
    if (score < 85) return 'primary';
    return 'success';
  };

  // Helper function to get strength icon
  const getStrengthIcon = (score) => {
    if (!score || score < 50) return faExclamationTriangle;
    if (score < 70) return faInfoCircle;
    return faCheckCircle;
  };

  return (
    <CContainer className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <CRow className="w-100 justify-content-center">
        <CCol md={6} lg={4}>
          <CCard className="shadow-lg border-0">
            <CCardHeader className="bg-primary text-white text-center py-3">
              <FontAwesomeIcon icon={faKey} size="2x" className="me-2" />
              <h4 className="d-inline align-middle">Reset Password</h4>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm onSubmit={handleSubmit}>
                {error && (
                  <CAlert color={isRecentlyUsed ? "warning" : "danger"} className="mb-3">
                    {isRecentlyUsed && (
                      <FontAwesomeIcon icon={faHistory} className="me-2" />
                    )}
                    {error}
                  </CAlert>
                )}
                
                {success && (
                  <CAlert color="success" className="mb-3">
                    {success}
                  </CAlert>
                )}
                
                <div className="mb-3">
                  <CFormInput 
                    type="password"
                    placeholder="New Password"
                    floatingLabel={
                      <>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        New Password
                      </>
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`mb-2 ${isRecentlyUsed ? 'border-warning' : ''}`}
                    autoComplete="new-password"
                  />
                  
                  {/* Enhanced AI-powered Password strength analysis */}
                  {password.length > 0 && (
                    <div className="mb-3 password-analyzer">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="d-flex align-items-center">
                          {aiAvailable && !aiError ? (
                            <CTooltip content="AI-powered password analysis">
                              <FontAwesomeIcon icon={faRobot} className="me-2 text-primary" />
                            </CTooltip>
                          ) : (
                            <CTooltip content="Basic password analysis">
                              <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-secondary" /> 
                            </CTooltip>
                          )}
                          Password Strength:
                        </span>
                        {isAnalyzing ? (
                          <CSpinner size="sm" color="primary" />
                        ) : (
                          passwordAnalysis && (
                            <CBadge color={getProgressColor(passwordAnalysis.score)} shape="rounded-pill">
                              <FontAwesomeIcon icon={getStrengthIcon(passwordAnalysis.score)} className="me-1" />
                              {passwordAnalysis.strength}
                            </CBadge>
                          )
                        )}
                      </div>
                      
                      {passwordAnalysis && !isAnalyzing && (
                        <>
                          <CProgress 
                            value={passwordAnalysis.score} 
                            color={getProgressColor(passwordAnalysis.score)} 
                            className="mb-2" 
                            animated
                          />
                          
                          {/* Password feedback */}
                          <div className="password-feedback mt-2">
                            {isRecentlyUsed && (
                              <div className="small text-warning mb-1 fw-bold">
                                <FontAwesomeIcon icon={faHistory} className="me-1" />
                                This password was used within the last 6 months
                              </div>
                            )}
                            
                            {passwordAnalysis.feedback && passwordAnalysis.feedback.map((tip, index) => (
                              <div key={index} className="small text-muted mb-1">
                                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                {tip}
                              </div>
                            ))}
                            
                            {passwordAnalysis.explanation && (
                              <div className="small text-muted mt-1 pt-1 border-top">
                                {passwordAnalysis.explanation}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {aiError && (
                        <CAlert color="warning" className="py-1 mt-2 mb-0 small">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                          {aiError}
                        </CAlert>
                      )}
                    </div>
                  )}
                  
                  <CFormInput 
                    type="password"
                    placeholder="Confirm Password"
                    floatingLabel={
                      <>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Confirm Password
                      </>
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                
                <CButton 
                  type="submit" 
                  color="primary" 
                  className="w-100"
                  disabled={
                    isSubmitting || 
                    isAnalyzing || 
                    password.length < 8 || 
                    password !== confirmPassword ||
                    (passwordAnalysis && passwordAnalysis.score < 30) ||
                    isRecentlyUsed
                  }
                >
                  {isSubmitting ? (
                    <>
                      <CSpinner size="sm" component="span" className="me-2" />
                      Updating...
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <CSpinner size="sm" component="span" className="me-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faKey} className="me-2" />
                      Update Password
                    </>
                  )}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}

export default ResetPass;