import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  CButton, 
  CForm, 
  CFormInput, 
  CCard, 
  CCardBody, 
  CCardTitle, 
  CAlert 
} from '@coreui/react'
import '../../../scss/forgot.scss' // Add this import for custom styles

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5053',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

const ForgotPass = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await api.post('/general/forgot-password', { email })
      
      if (response.data.message === 'Reset link sent to your email') {
        setMessage('Reset link sent successfully! Check your email.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessage('Failed to send reset link. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      console.error('Password reset error:', error)
    }
  }

  return (
    <div className="forgot-pass-container">
      <CCard className="forgot-pass-card">
        <CCardBody className="forgot-pass-card-body">
          <CCardTitle className="forgot-pass-title">Forgot Password</CCardTitle>
          <CForm onSubmit={handleSubmit}>
            {message && <CAlert color="info">{message}</CAlert>}
            <CFormInput
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="forgot-pass-input"
            />
            <CButton 
              type="submit" 
              color="primary" 
              className="mt-3 forgot-pass-button"
            >
              Send Reset Link
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ForgotPass