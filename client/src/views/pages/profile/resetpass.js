import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../../utils/axiosInstance'

// CoreUI imports
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CContainer,
  CRow,
  CCol
} from '@coreui/react'

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faKey } from '@fortawesome/free-solid-svg-icons'

function ResetPass() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { id, token } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const res = await axiosInstance.post(`/general/reset-password/${id}/${token}`, {
        password,
      })

      if (res.data.Status === 'Success') {
        navigate('/login')
      } else {
        setError(res.data.Message || 'Password reset failed')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <CContainer className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <CRow className="w-100 justify-content-center">
        <CCol md={6} lg={4}>
          <CCard className="shadow-lg border-0">
            <CCardHeader className="bg-primary text-white text-center py-3">
              <FontAwesomeIcon icon={faKey} size="2x" className="me-2" />
              <h4 className="d-inline align-middle">Reset Password</h4>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {error}
                  </div>
                )}
                
                <div className="mb-3">
                  <CFormInput 
                    type="password"
                    placeholder="New Password"
                    floatingLabel={
                      <>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        New Password
                      </>
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-3"
                  />
                  
                  <CFormInput 
                    type="password"
                    placeholder="Confirm Password"
                    floatingLabel={
                      <>
                        <FontAwesomeIcon icon={faLock} className="me-2" />
                        Confirm Password
                      </>
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <CButton 
                  type="submit" 
                  color="primary" 
                  className="w-100"
                >
                  Update Password
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ResetPass