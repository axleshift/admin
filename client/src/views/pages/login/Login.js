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
import Loader from '../../../components/Loader';

const Login = () => {
  const [data, setData] = useState({
    identifier: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
  
    if (!data.identifier || !data.password) {
      setErrorMessage('Both fields are required.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post('http://localhost:5053/client/login', data, {
        withCredentials: true,
      });
  
      if (response.data.accessToken) {
        // ✅ Debugging: Log the permissions in the response
        console.log("Permissions from Response:", response.data.user.permissions);
  
        // ✅ Store tokens in localStorage for persistent login
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
  
        // ✅ Store user data from login response (NO need for another API call)
        const { id, name, username, role, email, department, permissions } = response.data.user;
        sessionStorage.setItem('userId', id);
        sessionStorage.setItem('username', username || ''); // Ensure username is stored
        sessionStorage.setItem('name', name || '');
        sessionStorage.setItem('email', email || '');
        sessionStorage.setItem('role', role || '');
        sessionStorage.setItem('department', department || '');
        sessionStorage.setItem('permissions', JSON.stringify(permissions || []));
    
    
        // ✅ Log the stored permissions from sessionStorage
        console.log("Stored Permissions in sessionStorage:", sessionStorage.getItem('permissions'));
        console.log("Email stored in sessionStorage:", sessionStorage.getItem('email'));

        // ✅ Redirect user based on department
        switch (department.toLowerCase()) {
          case 'administrative':
            navigate('/employeedash');
            break;
          case 'hr':
            navigate('/hrdash');
            break;
          case 'core':
            navigate('/coredash');
            break;
          case 'finance':
            navigate('/financedash');
            break;
          case 'logistic':
            navigate('/logisticdash');
            break;
          default:
            setErrorMessage('Invalid department or access rights.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setErrorMessage(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  if (loading) {
    return <Loader />;
  }

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

                    {/* Input for Email or Name */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Email or Name"
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