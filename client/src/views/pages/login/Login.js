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
  
  const [data, setData] = useState({ identifier: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  
  
  const [accountLocked, setAccountLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lockExpiration, setLockExpiration] = useState(null);
  const [securityNotice, setSecurityNotice] = useState(null);
  
  const navigate = useNavigate();

  
  const [loginUser, { isLoading }] = useLoginUserMutation();

  
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
    
    
    setErrorMessage(null);
    setSecurityNotice(null);
    
    
    if (!data.identifier || !data.password) {
      setErrorMessage("Both username/email and password are required.");
      return;
    }
    
    try {
      const response = await loginUser(data).unwrap(); 
      console.log("Login Success:", response);
      
      
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      
      const { id, name, username, role, email, department } = response.user;
      
      
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
      
      
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("username", username || "");
      sessionStorage.setItem("name", name || "");
      sessionStorage.setItem("email", email || "");
      sessionStorage.setItem("role", role || "");
      sessionStorage.setItem("department", department || "");
      sessionStorage.setItem("permissions", JSON.stringify(permissions));
      
      
      console.log("📦 Session Storage after login:", {
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
    
      
      if (err.status === 429) {
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