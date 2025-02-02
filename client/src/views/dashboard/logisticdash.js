
import React from 'react'
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer,CRow,CCol } from '@coreui/react';
const logisticdash = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CustomHeader title="Logistic Dashboard" subtitle="Welcome to the Logistic Dashboard" />
        </CCol>
      </CRow>
    </CContainer>
    
  )
}

export default logisticdash
