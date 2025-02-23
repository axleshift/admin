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
import { useRegisterUserMutation } from '../../../state/adminApi';

const Register = () => {
  const [data, setData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    repeatPassword: '',
    role: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [registerUser] = useRegisterUserMutation()
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault()

    const errors = {}

    // Validate fields
    if (!data.name) errors.name = true
    if (!data.email) errors.email = true
    if (!data.phoneNumber) errors.phoneNumber = true
    if (!data.password) errors.password = true
    if (data.password !== data.repeatPassword) errors.repeatPassword = true
    if (!data.role) errors.role = true
    if (!data.department) errors.department = true

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setError('Please fill all required fields')
      return
    }

    // Clear errors if valid
    setValidationErrors({})
    setError('')

    const requestData = {
      ...data,
      adminUsername: data.role === 'admin' ? data.name : undefined,
    }

    setLoading(true)
    try {
      const response = await registerUser(requestData).unwrap()
      console.log(response)
      navigate('/worker')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
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
                      style={{
                        borderColor: validationErrors.name ? 'red' : '',
                      }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      style={{
                        borderColor: validationErrors.email ? 'red' : '',
                      }}
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
                      style={{
                        borderColor: validationErrors.phoneNumber ? 'red' : '',
                      }}
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
                      style={{
                        borderColor: validationErrors.password ? 'red' : '',
                      }}
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
                      style={{
                        borderColor: validationErrors.repeatPassword ? 'red' : '',
                      }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CFormSelect
                      aria-label="Select role"
                      value={data.role}
                      onChange={(e) => setData({ ...data, role: e.target.value })}
                      style={{
                        borderColor: validationErrors.role ? 'red' : '',
                      }}
                    >
                      <option value="">Select Role</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </CFormSelect>
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>Department</CInputGroupText>
                    <CFormSelect
                      value={data.department}
                      onChange={(e) => setData({ ...data, department: e.target.value })}
                      style={{
                        borderColor: validationErrors.department ? 'red' : '',
                      }}
                    >
                      <option value="">Select Department</option>
                      <option value="HR">HR</option>
                      <option value="Core">Core</option>
                      <option value="Finance">Finance</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Administrative">Administrative</option>
                    </CFormSelect>
                  </CInputGroup>

                  <CButton type="submit" color="success" disabled={loading}>
                    {loading ? 'Registering...' : 'Create Account'}
                  </CButton>
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