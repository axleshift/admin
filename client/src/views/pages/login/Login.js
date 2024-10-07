import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';

const Login = () => {
  const [data, setData] = useState({
    identifier: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
  
    // Validate data before sending request
    if (!data.identifier || !data.password) {
      setErrorMessage('Both fields are required.');
      return;
    }
  
    try {
      // Send a POST request to your backend's login endpoint
      const response = await axios.post('http://localhost:5053/client/login', data, { withCredentials: true });
  
      // Check if login was successful
      if (response.data.token) {
        // Fetch the user data if login is successful
        const userResponse = await axios.get('http://localhost:5053/client/user', { withCredentials: true });
  
        // Debugging: log full user response
        console.log("User response after login:", userResponse.data);
  
        if (userResponse.data.user) {
          const userName = userResponse.data.user.name || ''; // Default to empty if name is missing
          const userRole = userResponse.data.user.role || 'guest'; // Default role as 'guest' if role is missing
  
          // Save the user's name and role in session storage
          sessionStorage.setItem('userName', userName);
          sessionStorage.setItem('userRole', userRole);
  
          // Debugging: log saved role
          console.log("Saved User Role in session:", sessionStorage.getItem('userRole'));
  
          // Navigate to dashboard
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    }
  };
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={loginUser}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {/* Display error message if login fails */}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    {/* Input for Email or Username */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Email or Username"
                        autoComplete="email"
                        value={data.identifier}
                        onChange={(e) => setData({ ...data, identifier: e.target.value })}
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
                        required
                      />
                    </CInputGroup>

                    {/* Login Button */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link to="/home">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Sign Up Section */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Don't have an account? Register now to gain access.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
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
