import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CContainer,
  CRow,
  CCol,
  CAlert,
  CProgress,
  CSpinner,
  CTooltip,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import axiosInstance from '../../../utils/axiosInstance'
import { analyzePasswordWithAI, calculateEntropy } from '../../../utils/geminiPasswordAnalyzer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faInfoCircle, 
  faRobot, 
  faExclamationTriangle, 
  faCheckCircle, 
  faShieldAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons'

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

const ChangePass = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [passwordAnalysis, setPasswordAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiAvailable, setAiAvailable] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecentlyUsed, setIsRecentlyUsed] = useState(false)
  const navigate = useNavigate()

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
    if (newPassword) {
      debouncedAnalyzePassword(newPassword);
      const entropy = calculateEntropy(newPassword);
      if (entropy < 28) {
        setPasswordAnalysis((prev) => ({
          ...prev,
          feedback: [...(prev?.feedback || []), "Increase password complexity for better security."]
        }));
      }
    }
  }, [newPassword, debouncedAnalyzePassword]);
  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = localStorage.getItem('email')
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsRecentlyUsed(false)

    // Basic validation
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.')
      return
    }

    // Password strength validation
    if (!passwordAnalysis || passwordAnalysis.score < 30) {
      setErrorMessage('Please choose a stronger password.')
      return
    }

    setIsSubmitting(true)

    try {
      // Send a request to verify the current password and change to the new password
      const response = await axiosInstance.put('/client/change-password', {
        email,
        currentPassword,
        newPassword,
        passwordAnalysis: {
          score: passwordAnalysis.score,
          strength: passwordAnalysis.strength,
          aiPowered: aiAvailable && !aiError
        }
      })

      // Check if the password change was successful
      if (response.data.success) {
        setSuccessMessage('Password changed successfully!')
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordAnalysis(null)
        
        setTimeout(() => {
          navigate('/settings') // Navigate back to settings after success
        }, 2000) // Redirect after 2 seconds
      }
    } catch (error) {
      console.error('Error changing password:', error)
      
      if (error.response) {
        if (error.response.data.code === 'PASSWORD_RECENTLY_USED') {
          setIsRecentlyUsed(true)
          setErrorMessage('You cannot reuse a password that was used within the last 6 months.')
        } else {
          setErrorMessage(error.response.data.message || 'An error occurred. Please try again.')
        }
      } else {
        setErrorMessage('An error occurred. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to determine progress color
  const getProgressColor = (score) => {
    if (!score || score < 30) return 'danger'
    if (score < 50) return 'warning'
    if (score < 70) return 'info'
    if (score < 85) return 'primary'
    return 'success'
  }

  // Helper function to get strength icon
  const getStrengthIcon = (score) => {
    if (!score || score < 50) return faExclamationTriangle
    if (score < 70) return faInfoCircle
    return faCheckCircle
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8} lg={6}>
          <CCard className="shadow-sm">
            <CCardBody className="p-4">
              <h1 className="mb-4 text-center">Change Password</h1>
              
              {errorMessage && (
                <CAlert color={isRecentlyUsed ? "warning" : "danger"} className="mb-3">
                  {isRecentlyUsed && (
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                  )}
                  {errorMessage}
                </CAlert>
              )}
              
              {successMessage && (
                <CAlert color="success" className="mb-3">
                  {successMessage}
                </CAlert>
              )}
              
              <CForm onSubmit={handleSubmit}>
                {/* Current Password Input */}
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </CInputGroup>

                {/* New Password Input */}
                <CInputGroup className="mb-2">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={isRecentlyUsed ? 'border-warning' : ''}
                    autoComplete="new-password"
                  />
                </CInputGroup>

                {/* Password Strength Analysis */}
                {newPassword.length > 0 && (
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

                {/* Confirm New Password Input */}
                <CInputGroup className="mb-4">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </CInputGroup>

                <CButton 
                  type="submit" 
                  color="primary" 
                  className="px-4 w-100"
                  disabled={
                    isSubmitting || 
                    isAnalyzing || 
                    !currentPassword ||
                    newPassword.length < 8 || 
                    newPassword !== confirmPassword ||
                    (passwordAnalysis && passwordAnalysis.score < 30) ||
                    isRecentlyUsed
                  }
                >
                  {isSubmitting ? (
                    <>
                      <CSpinner size="sm" component="span" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ChangePass