import React from 'react' // Import React
import PropTypes from 'prop-types' // Import PropTypes
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

const CustomHeader = ({ title, subtitle }) => {
  // Accept title and subtitle as props
  return (
    // Add border-0 class to remove the border from CCard
    <CCard className="border-0">
      <CCardBody>
        <CCardTitle>{title}</CCardTitle> {/* Display the title */}
        <CCardText>{subtitle}</CCardText> {/* Display the subtitle */}
      </CCardBody>
    </CCard>
  )
}

// Add prop types validation
CustomHeader.propTypes = {
  title: PropTypes.string.isRequired, // title is required and must be a string
  subtitle: PropTypes.string.isRequired, // subtitle is required and must be a string
}

export default CustomHeader // Export the component
