import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilAt, cilLockLocked } from '@coreui/icons'; // Changed cilEnvelope to cilAt which is available
import {useGenerateOTPMutation, useVerifyOTPMutation} from '../../../state/adminApi'
// Define the API endpoints for OTP


const OTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email entry, 2 = OTP verification
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // RTK Query hooks
  const [generateOTP, { isLoading: isGenerating, isSuccess: isGenerated, error: generateError }] = useGenerateOTPMutation();
  const [verifyOTP, { isLoading: isVerifying, isSuccess: isVerified, error: verifyError }] = useVerifyOTPMutation();

  // Handle OTP generation
  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'danger' });
      return;
    }
    
    try {
      const response = await generateOTP(email).unwrap();
      setMessage({ text: response.message || 'OTP sent to your email', type: 'success' });
      setStep(2);
    } catch (err) {
      setMessage({ 
        text: err.data?.message || 'Failed to generate OTP. Please try again.', 
        type: 'danger' 
      });
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!otp) {
      setMessage({ text: 'Please enter the OTP sent to your email', type: 'danger' });
      return;
    }
    
    try {
      const response = await verifyOTP({ email, otp }).unwrap();
      setMessage({ text: response.message || 'Account unlocked successfully', type: 'success' });
      
      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage({ 
        text: err.data?.message || 'Invalid or expired OTP. Please try again.', 
        type: 'danger' 
      });
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <h1 className="mb-4">Account Unlock</h1>
                  
                  {/* Alert Messages */}
                  {message.text && (
                    <CAlert color={message.type}>
                      {message.text}
                    </CAlert>
                  )}
                  
                  {/* Step 1: Email Entry Form */}
                  {step === 1 && (
                    <CForm onSubmit={handleGenerateOTP}>
                      <p className="text-body-secondary mb-4">
                        Enter your email to receive a one-time password that will unlock your account.
                      </p>
                      
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilAt} /> {/* Using cilAt instead of cilEnvelope */}
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Email address"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isGenerating}
                          required
                        />
                      </CInputGroup>
                      
                      <CRow>
                        <CCol xs={6}>
                          <CButton 
                            type="submit" 
                            color="primary" 
                            className="px-4" 
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> Sending...
                              </>
                            ) : (
                              "Send OTP"
                            )}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-end">
                          <Link to="/login">
                            <CButton color="link" className="px-0">
                              Back to Login
                            </CButton>
                          </Link>
                        </CCol>
                      </CRow>
                    </CForm>
                  )}
                  
                  {/* Step 2: OTP Verification Form */}
                  {step === 2 && (
                    <CForm onSubmit={handleVerifyOTP}>
                      <p className="text-body-secondary mb-4">
                        Enter the 6-digit code sent to <strong>{email}</strong>
                      </p>
                      
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={isVerifying}
                          maxLength={6}
                          required
                        />
                      </CInputGroup>
                      
                      <CRow>
                        <CCol xs={6}>
                          <CButton 
                            type="submit" 
                            color="primary" 
                            className="px-4" 
                            disabled={isVerifying}
                          >
                            {isVerifying ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-end">
                          <CButton 
                            type="button"
                            color="link" 
                            className="px-0"
                            onClick={() => setStep(1)}
                            disabled={isVerifying}
                          >
                            Change Email
                          </CButton>
                        </CCol>
                      </CRow>
                      
                      <CRow className="mt-3">
                        <CCol xs={12} className="text-center">
                          <CButton 
                            type="button"
                            color="link" 
                            className="px-0"
                            onClick={() => handleGenerateOTP({ preventDefault: () => {} })}
                            disabled={isVerifying || isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <CSpinner size="sm" className="me-2" /> Resending...
                              </>
                            ) : (
                              "Resend OTP"
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  )}
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default OTP;