import React from 'react'
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer,CRow,CCol } from '@coreui/react';
const coredash = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CustomHeader title="Core Dashboard" subtitle="Welcome to the Core Dashboard" />
        </CCol>
      </CRow>
    </CContainer>
    
  )
}

export default coredash

