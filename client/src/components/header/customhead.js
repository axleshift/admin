import React from 'react'
import PropTypes from 'prop-types' 
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

const CustomHeader = ({ title, subtitle }) => {
 
  return (

    <CCard className="border-0">
      <CCardBody>
        <CCardTitle>{title}</CCardTitle> 
        <CCardText>{subtitle}</CCardText>
      </CCardBody>
    </CCard>
  )
}

CustomHeader.propTypes = {
  title: PropTypes.string.isRequired, 
  subtitle: PropTypes.string.isRequired, 
}

export default CustomHeader 
