import React from 'react';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol } from '@coreui/react';
import AnnouncementList from '../pages/Announcement/AnnouncementList';

const LogisticDash = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CustomHeader title="Logistic Dashboard" subtitle="Welcome to the Logistic Dashboard" />
          <AnnouncementList />
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default LogisticDash;
