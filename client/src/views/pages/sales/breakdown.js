import React from 'react';
import { CRow, CCol, CCard, CCardHeader, CCardBody } from '@coreui/react';
import CustomHeader from '../../../components/header/customhead';
import BreakdownChart from './breakdownchart';

const Breakdown = () => {
  return (
    <CRow>
      <CCol xs={12} md={12}>
        <CCard>
          <CCardHeader>
            <CustomHeader title="BREAKDOWN" subtitle="Breakdown of Sales" />
          </CCardHeader>
          <CCardBody>
            <BreakdownChart />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Breakdown;
