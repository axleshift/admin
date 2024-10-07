// src/views/customers/add.js
import React, { useState } from 'react';
import {
  CCard,
  CForm,
  CFormInput,
  CButton,
  CContainer,
  CRow,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser, cilPhone } from '@coreui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Add = () => { 
  const [data, setData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    role: 'user',
    occupation: '',
    password: '',
    repeatPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (data.password !== data.repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!data.name || !data.email || !data.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5053/client/register', data);
      console.log(response.data);
      
      
      navigate('/customer'); // Adjust this path based on your routing setup
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer>
      <CRow>
        <CCard className="p-3">
          <h4>Client Info</h4>
          <CForm onSubmit={handleRegister}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                placeholder="Name"
                autoComplete="name"
                name="name"
                value={data.name}
                onChange={handleChange}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>@</CInputGroupText>
              <CFormInput
                placeholder="Email"
                autoComplete="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText>
                <CIcon icon={cilPhone} />
              </CInputGroupText>
              <CFormInput
                placeholder="Phone Number"
                autoComplete="phoneNumber"
                name="phoneNumber"
                value={data.phoneNumber}
                onChange={handleChange}
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
                name="password"
                value={data.password}
                onChange={handleChange}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Repeat Password"
                autoComplete="new-password"
                name="repeatPassword"
                value={data.repeatPassword}
                onChange={handleChange}
                required
              />
            </CInputGroup>
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
        </CCard>
      </CRow>
    </CContainer>
  );
};

export default Add;
