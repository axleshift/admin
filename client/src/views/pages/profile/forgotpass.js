import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CButton, CForm, CFormInput, CCard, CCardBody, CCardTitle, CAlert } from '@coreui/react'
import axiosInstance from '../../../utils/axiosInstance'
const ForgotPass = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Set default Axios configurations
  axios.defaults.withCredentials = true

  const handleSubmit = (e) => {
    e.preventDefault()

    axiosInstance
      .post('/general/forgot-password', { email })
      .then((res) => {
        if (res.data.message === 'Reset link sent to your email') {
          setMessage('Reset link sent successfully! Check your email.')
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        } else {
          setMessage('Failed to send reset link. Please try again.')
        }
      })
      .catch((err) => {
        setMessage('An error occurred. Please try again.')
        console.error(err) // Use console.error for better error visibility
      })
  }

  return (
    <CCard>
      <CCardBody>
        <CCardTitle>Forgot Password</CCardTitle>
        <CForm onSubmit={handleSubmit}>
          {message && <CAlert color="info">{message}</CAlert>}
          <CFormInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <CButton type="submit" color="primary" className="mt-3">
            Send Reset Link
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ForgotPass
