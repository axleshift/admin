import React from 'react'
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer,CRow,CCol } from '@coreui/react';
const financedash = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CustomHeader title="Finance Dashboard" subtitle="Welcome to the Finance Dashboard" />
        </CCol>
      </CRow>
    </CContainer>
    
  )
}

export default financedash


