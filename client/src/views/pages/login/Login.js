import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {
  const [data, setData] = useState({
    identifier: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const navigate = useNavigate()

  const loginUser = async (e) => {
    e.preventDefault();

    if (!data.identifier || !data.password) {
        setErrorMessage('Both fields are required.');
        return;
    }

    try {
        const response = await axios.post('http://localhost:5053/client/login', data, {
            withCredentials: true,
        });

        if (response.data.token) {
            const userResponse = await axios.get('http://localhost:5053/client/user', {
                withCredentials: true,
            });

            if (userResponse.data.user) {
                const { name, role, email, username, department } = userResponse.data.user;

                sessionStorage.setItem('name', name || '');
                sessionStorage.setItem('role', role || '');
                sessionStorage.setItem('email', email || '');
                sessionStorage.setItem('username', username || '');
                sessionStorage.setItem('department', department || ''); // Save department

                navigate('/employeedash');
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

              {/* Sign Up Section */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Don&apos;t have an account? Register now to gain access.</p>
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
  )
}

export default Login
