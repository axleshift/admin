import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CButton, 
  CForm, 
  CFormInput, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CContainer, 
  CRow, 
  CCol, 
  CAlert 
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from '../../../utils/axiosInstance'

const ForgotPass = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setMessageType('danger')
      setIsLoading(false)
      return
    }

    axiosInstance
      .post('/general/forgot-password', { email })
      .then((res) => {
        if (res.data.message === 'Reset link sent to your email') {
          setMessage('Reset link sent successfully! Check your email.')
          setMessageType('success')
          
          // Auto-navigate after successful reset link send
          setTimeout(() => {
            navigate('/login')
          }, 2500)
        } else {
          setMessage('Failed to send reset link. Please try again.')
          setMessageType('danger')
        }
      })
      .catch((err) => {
        console.error(err)
        const errorMessage = err.response?.data?.message || 
                             'An error occurred. Please try again.'
        setMessage(errorMessage)
        setMessageType('danger')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <CContainer className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <CRow className="w-100 justify-content-center">
        <CCol md={6} lg={4}>
          <CCard className="shadow-lg border-0">
            <CCardHeader className="bg-primary text-white text-center py-3">
              <FontAwesomeIcon icon={faKey} size="2x" className="me-2" />
              <h4 className="d-inline align-middle">Forgot Password</h4>
            </CCardHeader>
            <CCardBody className="p-4">
              <CForm onSubmit={handleSubmit}>
                {message && (
                  <CAlert color={messageType} className="mb-3">
                    {message}
                  </CAlert>
                )}
                
                <div className="mb-3">
                  <CFormInput 
                    type="email"
                    placeholder="Enter your email"
                    floatingLabel={
                      <>
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Email Address
                      </>
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <CButton 
                  type="submit" 
                  color="primary" 
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </CButton>

                <div className="text-center mt-3">
                  <a 
                    href="/login" 
                    className="text-decoration-none text-muted"
                  >
                    Remember your password? Login
                  </a>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default ForgotPass