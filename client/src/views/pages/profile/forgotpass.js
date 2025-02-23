import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePostForgotPasswordMutation } from '../../../state/adminApi' // Adjust the path based on your project structure
import { CButton, CForm, CFormInput, CCard, CCardBody, CCardTitle, CAlert } from '@coreui/react'

const ForgotPass = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [postForgotPassword, { isLoading, error }] = usePostForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await postForgotPassword(email).unwrap()
      if (response.message === 'Reset link sent to your email') {
        setMessage('Reset link sent successfully! Check your email.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessage('Failed to send reset link. Please try again.')
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.')
      console.error(err) // Use console.error for better error visibility
    }
  }

  return (
    <CCard>
      <CCardBody>
        <CCardTitle>Forgot Password</CCardTitle>
        <CForm onSubmit={handleSubmit}>
          {message && <CAlert color="info">{message}</CAlert>}
          {error && <CAlert color="danger">{error.data?.message || 'Something went wrong'}</CAlert>}
          <CFormInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <CButton type="submit" color="primary" className="mt-3" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ForgotPass
