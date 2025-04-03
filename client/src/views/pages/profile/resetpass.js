import React, { useState, useEffect } from 'react';
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
  CAlert
} from '@coreui/react';

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faKey, faInfoCircle, faRobot } from '@fortawesome/free-solid-svg-icons';

function ResetPass() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordAnalysis, setPasswordAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const navigate = useNavigate();
  const { id, token } = useParams();

  // Create a debounced function to avoid excessive API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Analyze password with AI whenever it changes (with 500ms debounce)
  useEffect(() => {
    const analyzeWithDelay = debounce(async (pass) => {
      if (pass.length >= 4) { // Only analyze if password has reasonable length
        setIsAnalyzing(true);
        setAiError(null);
        try {
          const analysis = await analyzePasswordWithAI(pass);
          setPasswordAnalysis(analysis);
        } catch (err) {
          console.error('Password analysis error:', err);
          setAiError('Could not analyze password strength');
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setPasswordAnalysis(null);
      }
    }, 500);

    if (password) {
      analyzeWithDelay(password);
    } else {
      setPasswordAnalysis(null);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Prevent weak passwords
    if (passwordAnalysis && passwordAnalysis.score < 40) {
      setError('Please choose a stronger password');
      return;
    }

    try {
      const res = await axiosInstance.post(`/general/reset-password/${id}/${token}`, {
        password,
        passwordAnalysis: {
          score: passwordAnalysis?.score,
          strength: passwordAnalysis?.strength
        }
      });

      if (res.data.Status === 'Success') {
        navigate('/login');
      } else {
        setError(res.data.Message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  // Helper function to determine progress color
  const getProgressColor = (score) => {
    if (score < 40) return 'danger';
    if (score < 60) return 'warning';
    if (score < 80) return 'info';
    return 'success';
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
                  <CAlert color="danger" className="mb-3">
                    {error}
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
                    className="mb-2"
                    autoComplete="new-password"
                  />
                  
                  {/* AI-powered Password strength analysis */}
                  {password.length > 0 && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faRobot} className="me-2 text-primary" />
                          AI Password Analysis:
                        </span>
                        {isAnalyzing ? (
                          <CSpinner size="sm" color="primary" />
                        ) : (
                          passwordAnalysis && (
                            <span className={`text-${getProgressColor(passwordAnalysis.score)}`}>
                              {passwordAnalysis.strength}
                            </span>
                          )
                        )}
                      </div>
                      
                      {passwordAnalysis && !isAnalyzing && (
                        <>
                          <CProgress value={passwordAnalysis.score} color={getProgressColor(passwordAnalysis.score)} className="mb-2" />
                          
                          {/* Password feedback from AI */}
                          <div className="password-feedback mt-2">
                            {passwordAnalysis.feedback.map((tip, index) => (
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
                  disabled={isAnalyzing || (passwordAnalysis && passwordAnalysis.score < 40)}
                >
                  {isAnalyzing ? (
                    <>
                      <CSpinner size="sm" component="span" className="me-2" />
                      Analyzing...
                    </>
                  ) : (
                    "Update Password"
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