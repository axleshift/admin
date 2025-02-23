import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordMutation } from '../../../state/adminApi';
import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CContainer,
  CRow,
  CCol,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePass = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const navigate = useNavigate();

  const [changePassword, { isLoading, error }] = useChangePasswordMutation();

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    try {
      await changePassword({ email, currentPassword, newPassword }).unwrap();
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => navigate('/settings'), 2000);
    } catch (err) {
      setErrorMessage(err.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <CCard>
            <CCardBody>
              <h1>Change Password</h1>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
              <CForm onSubmit={handleSubmit}>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type={showPassword.current ? 'text' : 'password'}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <CInputGroupText onClick={() => togglePasswordVisibility('current')} style={{ cursor: 'pointer' }}>
                    {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                  </CInputGroupText>
                </CInputGroup>

                <CInputGroup className="mb-4">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type={showPassword.new ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <CInputGroupText onClick={() => togglePasswordVisibility('new')} style={{ cursor: 'pointer' }}>
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </CInputGroupText>
                </CInputGroup>

                <CInputGroup className="mb-4">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type={showPassword.confirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <CInputGroupText onClick={() => togglePasswordVisibility('confirm')} style={{ cursor: 'pointer' }}>
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </CInputGroupText>
                </CInputGroup>

                <CButton type="submit" color="primary" className="px-4" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Change Password'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ChangePass;
