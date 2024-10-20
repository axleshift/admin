import React from 'react' // Import React
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

const CustomHeader = ({ title, subtitle }) => {
  // Accept title and subtitle as props
  return (
    // Return the JSX
    <CCard>
      <CCardBody>
        <CCardTitle>{title}</CCardTitle> {/* Display the title */}
        <CCardText>{subtitle}</CCardText> {/* Display the subtitle */}
      </CCardBody>
    </CCard>
  )
}

export default CustomHeader // Export the component
