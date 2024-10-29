import React from 'react';
import { CContainer, CRow, CCol } from '@coreui/react';
import WidgetsDropdown from '../widgets/WidgetsDropdown';

const Employeedash = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <h3>Dashboard</h3>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <WidgetsDropdown className="mb-4" />
        </CCol>
      </CRow>
    </CContainer>
  );
}

export default Employeedash;
