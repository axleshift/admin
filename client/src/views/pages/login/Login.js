import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../../../state/adminApi";
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
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";

const Login = () => {
  // Form state
  const [data, setData] = useState({ identifier: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Security states
  const [accountLocked, setAccountLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lockExpiration, setLockExpiration] = useState(null);
  const [securityNotice, setSecurityNotice] = useState(null);
  
  const navigate = useNavigate();

  // RTK Query hook
  const [loginUser, { isLoading }] = useLoginUserMutation();

  // Countdown timer for locked accounts
  React.useEffect(() => {
    let interval = null;
    
    if (accountLocked && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prevTime => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            setAccountLocked(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [accountLocked, remainingTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error messages
    setErrorMessage(null);
    setSecurityNotice(null);
    
    // Basic validation
    if (!data.identifier || !data.password) {
      setErrorMessage("Both username/email and password are required.");
      return;
    }
    
    try {
      const response = await loginUser(data).unwrap(); 
      console.log("Login Success:", response);
      
      // Store tokens in LocalStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      // Store user data in SessionStorage
      const { id, name, username, role, email, department, permissions } = response.user;
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("username", username || "");
      sessionStorage.setItem("name", name || "");
      sessionStorage.setItem("email", email || "");
      sessionStorage.setItem("role", role || "");
      sessionStorage.setItem("department", department || "");
      sessionStorage.setItem("permissions", JSON.stringify(permissions || []));
      
      // Check for security notice in the response
      if (response.securityAlert) {
        setSecurityNotice(response.securityAlert.message || "Unusual activity detected on your account.");
      }
      
      // Route to appropriate dashboard based on department
      switch (department?.toLowerCase()) {
        case "administrative":
          navigate("/employeedash");
          break;
        case "hr":
          navigate("/hrdash");
          break;
        case "core":
          navigate("/coredash");
          break;
        case "finance":
          navigate("/financedash");
          break;
        case "logistics":
          navigate("/logisticdash");
          break;
        default:
          navigate("/dashboard"); // Default dashboard if department is not recognized
      }
      
    } catch (err) {
      console.error("Login Failed:", err);
      
      // Handle account locking (429 Too Many Requests)
      if (err.status === 429) {
        // Mark just this account as locked, not the entire login form
        setAccountLocked(true);
        
        // If server provided a lockout time
        if (err.data?.lockedUntil) {
          const lockoutTime = new Date(err.data.lockedUntil);
          const currentTime = new Date();
          const timeRemaining = Math.ceil((lockoutTime - currentTime) / 1000);
          
          if (timeRemaining > 0) {
            setRemainingTime(timeRemaining);
            setLockExpiration(lockoutTime);
          } else {
            setRemainingTime(300); // Default to 5 minutes if calculation is off
            
            const defaultExpiration = new Date();
            defaultExpiration.setMinutes(defaultExpiration.getMinutes() + 5);
            setLockExpiration(defaultExpiration);
          }
        } else {
          // Default lockout of 5 minutes if server doesn't provide exact time
          setRemainingTime(300);
          
          const defaultExpiration = new Date();
          defaultExpiration.setMinutes(defaultExpiration.getMinutes() + 5);
          setLockExpiration(defaultExpiration);
        }
        
        setErrorMessage(err.data?.message || "Too many failed login attempts. This account is temporarily locked.");
      } else {
        // Handle other error types
        setErrorMessage(err.data?.message || "Login failed. Please check your credentials and try again.");
      }
    }
  };

  // Format remaining time as MM:SS
  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine if the current user input should be disabled
  const isCurrentAccountLocked = accountLocked && data.identifier !== "";

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    
                    {/* Security Notice */}
                    {securityNotice && (
                      <CAlert color="warning">
                        <strong>Security Notice:</strong> {securityNotice}
                      </CAlert>
                    )}

                    {/* Account Lockout Message - Only show if the current username is locked */}
                    {isCurrentAccountLocked && (
                      <CAlert color="danger">
                        <strong>Account Temporarily Locked</strong>
                        <p>This account ({data.identifier}) has been temporarily locked due to too many failed login attempts. 
                        Please try again in {formatRemainingTime()}.</p>
                        {lockExpiration && (
                          <small>Lockout expires at: {lockExpiration.toLocaleTimeString()}</small>
                        )}
                      </CAlert>
                    )}

                    {/* Error Message */}
                    {!isCurrentAccountLocked && errorMessage && (
                      <CAlert color="danger">{errorMessage}</CAlert>
                    )}

                    {/* Email/Username Input */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Email or Username"
                        autoComplete="email"
                        value={data.identifier}
                        onChange={(e) => {
                          // Reset account locked state when changing identifier
                          if (e.target.value !== data.identifier) {
                            setAccountLocked(false);
                            setErrorMessage(null);
                          }
                          setData({ ...data, identifier: e.target.value })
                        }}
                        disabled={isLoading}
                        required
                      />
                    </CInputGroup>

                    {/* Password Input */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        disabled={isLoading || isCurrentAccountLocked}
                        required
                      />
                    </CInputGroup>

                    {/* Login Button */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton 
                          type="submit" 
                          color="primary" 
                          className="px-4" 
                          disabled={isLoading || isCurrentAccountLocked}
                        >
                          {isLoading ? (
                            <>
                              <CSpinner size="sm" className="me-2" /> Logging in...
                            </>
                          ) : isCurrentAccountLocked ? (
                            "Account Locked"
                          ) : (
                            "Login"
                          )}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <Link to="/forgotpass">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;