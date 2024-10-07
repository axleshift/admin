import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilPhone, cilUser } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    repeatPassword: '',
    role: '',
    adminUsername: '',  // New field for admin's username
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate password match
    if (data.password !== data.repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check for empty fields
    if (!data.name || !data.email || !data.password || !data.role) {
      setError('All fields are required');
      return;
    }

    // If role is admin, employee, or manager, check for admin username
    if (['admin', 'manager', 'employee'].includes(data.role) && !data.adminUsername) {
      setError('Admin username is required for the selected role');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5053/client/register', data);
      console.log(response.data);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4" style={{ padding: '20px', marginBottom: '20px' }}>
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Name"
                      autoComplete="name"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Phone Number"
                      autoComplete="phoneNumber"
                      value={data.phoneNumber}
                      onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={data.password}
                      onChange={(e) => setData({ ...data, password: e.target.value })}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={data.repeatPassword}
                      onChange={(e) => setData({ ...data, repeatPassword: e.target.value })}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CFormSelect
                      aria-label="Select role"
                      value={data.role}
                      onChange={(e) => setData({ ...data, role: e.target.value })}
                    >
                      <option value="">Role</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </CFormSelect>
                  </CInputGroup>

                  {/* Conditionally display admin username input */}
                  {['admin', 'manager', 'employee'].includes(data.role) && (
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Admin Username"
                        value={data.adminUsername}
                        onChange={(e) => setData({ ...data, adminUsername: e.target.value })}
                      />
                    </CInputGroup>
                  )}

                  <div className="d-grid">
                    <CButton 
                      color="success" 
                      type="submit" 
                      disabled={loading} 
                      style={{ padding: '10px', marginTop: '10px' }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;
