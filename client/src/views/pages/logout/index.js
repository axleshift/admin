import { useNavigate } from "react-router-dom"
import React from 'react'

const index = () => {
  const navigate = useNavigate();
  return (
    <div>
     navigate('/login')
    </div>
  )
}

export default index
