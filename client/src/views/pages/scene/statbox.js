import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CCard, CCardBody, CCardHeader, CCardFooter, CRow, CCol } from '@coreui/react';

const StatBox = ({ title, value, increase, icon, description }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const darkModeStatus = localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('dark-mode');
    setIsDarkMode(darkModeStatus);
  }, []);

  return (
    <CCard 
      className={`mb-4 ${isDarkMode ? 'bg-dark text-white' : ''}`}
    >
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>{title}</div>
        <div>{icon}</div>
      </CCardHeader>
      <CCardBody className="d-flex align-items-center justify-content-center">
        <h2 className="display-4 fw-bold">{value}</h2>
      </CCardBody>
      <CCardFooter>
        <CRow>
          <CCol className="text-medium-emphasis fst-italic">
            {increase}
          </CCol>
          <CCol className="text-end">
            {description}
          </CCol>
        </CRow>
      </CCardFooter>
    </CCard>
  );
};

StatBox.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  increase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  description: PropTypes.string.isRequired,
};

export default StatBox;