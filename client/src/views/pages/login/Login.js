import React, { useState, useEffect } from "react";
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

const RECAPTCHA_SITE_KEY = "6LdeRSErAAAAAO_tTaCq0sa9yVOtB3-jl6avr05G";

const Login = () => {
  
  const [data, setData] = useState({ identifier: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lockExpiration, setLockExpiration] = useState(null);
  const [securityNotice, setSecurityNotice] = useState(null);
  const [showOtpOption, setShowOtpOption] = useState(false);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaError, setCaptchaError] = useState(null);

  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  // Check for existing login session and auto-navigate
  useEffect(() => {
    const checkExistingSession = () => {
      const accessToken = localStorage.getItem("accessToken");
      const department = localStorage.getItem("department");
      
      if (accessToken) {
        console.log("Found existing session, navigating to dashboard...");
        
        // Navigate based on department
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
            navigate("/dashboard"); 
        }
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  // Load reCAPTCHA script dynamically to ensure it's available
  useEffect(() => {
    // Update the loadRecaptchaScript function
    const loadRecaptchaScript = () => {
      // Check if reCAPTCHA is already loaded
      if ((window.grecaptcha && window.grecaptcha.enterprise) || 
          (window.grecaptcha && window.grecaptcha.ready)) {
        
        const readyFunction = window.grecaptcha.enterprise ? 
          window.grecaptcha.enterprise.ready : 
          window.grecaptcha.ready;
        
        readyFunction(() => {
          setCaptchaReady(true);
          console.log("✅ reCAPTCHA is ready");
        });
        return;
      }

      // Determine which version to load (enterprise or regular)
      // You should check your environment and configuration to decide
      const useEnterprise = true; // Set based on your needs

      const script = document.createElement("script");
      script.src = useEnterprise ? 
        `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}` :
        `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (useEnterprise && window.grecaptcha && window.grecaptcha.enterprise) {
          window.grecaptcha.enterprise.ready(() => {
            setCaptchaReady(true);
            console.log("✅ reCAPTCHA Enterprise is ready");
          });
        } else if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setCaptchaReady(true);
            console.log("✅ reCAPTCHA v3 is ready");
          });
        } else {
          setCaptchaError("Failed to initialize reCAPTCHA.");
          console.error("❌ reCAPTCHA initialization failed");
        }
      };

      script.onerror = () => {
        setCaptchaError("Failed to load reCAPTCHA script.");
        console.error("❌ Failed to load reCAPTCHA script");
      };

      document.head.appendChild(script);
    };
    
    loadRecaptchaScript();
  }, []);

  // Timer for locked accounts
  useEffect(() => {
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

  const executeRecaptcha = async () => {
    if (!captchaReady || captchaError) {
      console.warn("Skipping reCAPTCHA verification due to errors or not ready.");
      return "recaptcha-unavailable";
    }
    
    try {
      let token = null;
      
      // Check if using enterprise or regular reCAPTCHA
      if (window.grecaptcha?.enterprise) {
        console.log("Using reCAPTCHA Enterprise");
        token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: "login" });
        console.log("Generated enterprise reCAPTCHA token");
        return token;
      } else if (window.grecaptcha?.execute) {
        console.log("Using reCAPTCHA v3");
        token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "login" });
        return token;
      } else {
        console.warn('No reCAPTCHA method available');
        return "recaptcha-unavailable";
      }
    } catch (error) {
      console.error("Error executing reCAPTCHA:", error);
      return "recaptcha-unavailable";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSecurityNotice(null);
    
    if (!data.identifier || !data.password) {
      setErrorMessage("Both username/email and password are required.");
      return;
    }
    
    try {
      // Get reCAPTCHA token
      const captchaToken = await executeRecaptcha();
      
      // Check if we got a valid token
      if (captchaToken === "recaptcha-unavailable") {
        console.warn("reCAPTCHA unavailable, proceeding without verification");
      } else {
        console.log("Generated reCAPTCHA token:", captchaToken);
      }
      
      // Prepare login data - FIXED: Ensure captchaToken is included
      const loginData = {
        identifier: data.identifier,
        password: data.password,
        captchaToken: captchaToken // This ensures the token is included in the payload
      };
      
      console.log("Login request payload:", loginData);
      
      // Send login request
      const response = await loginUser(loginData).unwrap();
      console.log("Login Success:", response);
      
      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      // Extract user data
      const { id, name, username, role, email, department } = response.user;
      
      // Handle user permissions
      let permissions = [];
      if (response.user.permissions) {
        if (Array.isArray(response.user.permissions)) {
          permissions = response.user.permissions;
          console.log("✅ User permissions array:", permissions);
        } else {
          console.warn("⚠️ Server returned permissions in unexpected format:", response.user.permissions);
          
          try {
            const parsedPermissions = typeof response.user.permissions === 'string' 
              ? JSON.parse(response.user.permissions) 
              : response.user.permissions;
              
            if (Array.isArray(parsedPermissions)) {
              permissions = parsedPermissions;
              console.log("✅ Converted permissions to array:", permissions);
            }
          } catch (parseError) {
            console.error("❌ Failed to parse permissions:", parseError);
          }
        }
      } else {
        console.warn("⚠️ No permissions found in user data");
      }
      
      // Handle default permissions if needed
      if (permissions.length === 0 && role && department) {
        try {
          const permissionsConfig = await import('../../../components/permissionConfig');
          
          if (permissionsConfig.accessPermissions[role]?.[department]) {
            permissions = permissionsConfig.accessPermissions[role][department];
            console.log("✅ Using default role-based permissions:", permissions);
          }
        } catch (importError) {
          console.error("❌ Failed to import permissions config:", importError);
        }
      }
      
      // Store user data in localStorage
      localStorage.setItem("userId", id);
      localStorage.setItem("username", username || "");
      localStorage.setItem("name", name || "");
      localStorage.setItem("email", email || "");
      localStorage.setItem("role", role || "");
      localStorage.setItem("department", department || "");
      localStorage.setItem("permissions", JSON.stringify(permissions));
      
      console.log("📦 Local Storage after login:", {
        userId: id,
        username: username || "",
        name: name || "",
        email: email || "",
        role: role || "",
        department: department || "",
        permissions: permissions
      });
      
      if (response.securityAlert) {
        setSecurityNotice(response.securityAlert.message || "Unusual activity detected on your account.");
      }
      
      // Navigate to the appropriate dashboard
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
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Failed:", err);
      
      if (err.status === 400) {
        setErrorMessage(err.data?.message || "Invalid request. Please check your input.");
      } else if (err.status === 403) {
        setErrorMessage("CAPTCHA verification failed. Please try again.");
      } else if (err.status === 429) {
        setAccountLocked(true);
    
        if (err.data?.lockedUntil) {
          const lockoutTime = new Date(err.data.lockedUntil);
          const currentTime = new Date();
          const timeRemaining = Math.ceil((lockoutTime - currentTime) / 1000);
    
          setRemainingTime(timeRemaining > 0 ? timeRemaining : 900);  
          setLockExpiration(lockoutTime);
        } else {
          setRemainingTime(900);  
          const defaultExpiration = new Date();
          defaultExpiration.setMinutes(defaultExpiration.getMinutes() + 15); 
          setLockExpiration(defaultExpiration);
        }
    
        setErrorMessage(err.data?.message || "Too many failed login attempts. This account is temporarily locked.");
        setShowOtpOption(true);
      } else {
        const remainingAttempts = err.data?.remainingAttempts;
        if (remainingAttempts !== undefined) {
          setErrorMessage(`Invalid credentials. You have ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.`);
        } else {
          setErrorMessage(err.data?.message || "Login failed. Please check your credentials and try again.");
        }
      }
    }
  };

  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
                    
                    {/* reCAPTCHA Status/Error Alert */}
                    {captchaError && (
                      <CAlert color="warning">
                        <strong>Security Verification Issue:</strong> {captchaError}
                      </CAlert>
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
  
                    {/* Login Button Row */}
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
  
                    {/* OTP Button - New Addition */}
                    {isCurrentAccountLocked && (
                      <CRow className="mt-3">
                        <CCol xs={12}>
                          <CButton 
                            type="button" 
                            color="secondary" 
                            className="w-100" 
                            onClick={() => window.location.href = "/OTP"}
                          >
                            Use OTP to Unlock Account
                          </CButton>
                        </CCol>
                      </CRow>
                    )}
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