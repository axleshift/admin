import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'

const CustomHeader = ({ title, subtitle }) => {
  return (
    <CCard className="border-0 shadow-sm mb-4 bg-gradient-light">
      <CCardBody className="py-4">
        <CCardTitle className="fw-bold fs-3 mb-3 text-primary">{title}</CCardTitle>
        <CCardText className="text-secondary fs-5 fw-light">{subtitle}</CCardText>
      </CCardBody>
    </CCard>
  )
}

CustomHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
}

export default CustomHeader