import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useResetPasswordMutation } from '../../../state/adminApi'

function ResetPass() {
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { id, token } = useParams()
  const [resetPassword] = useResetPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('ID:', id)
    console.log('Token:', token)
    console.log('Password:', password)

    try {
      const res = await resetPassword({ id, token, password }).unwrap()
      console.log('Response:', res)

      if (res.Status === 'Success') {
        navigate('/login')
      } else {
        console.error('Reset failed:', res)
      }
    } catch (err) {
      console.error('Error:', err.message)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h4>Reset Password</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>New Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              autoComplete="off"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">
            Update
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPass
