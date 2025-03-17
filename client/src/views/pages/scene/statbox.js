import React, { useState, useEffect } from 'react';
import FlexBetween from './FlexBetween';
import PropTypes from 'prop-types';


const StatBox = ({ title, value, increase, icon, description }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  
  useEffect(() => {
    const darkModeStatus = localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('dark-mode');
    setIsDarkMode(darkModeStatus);
  }, []);

  return (
    <div
      style={{
        flex: '1 1 100%',
        padding: '1.5rem',
        borderRadius: '0.55rem',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: isDarkMode ? '#000' : '#d3d3d3', 
        color: isDarkMode ? '#808080' : 'black', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '10px',
        minWidth: '250px',
        height: '100%',
      }}
    >
      <FlexBetween>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h1>
        {icon}
      </FlexBetween>

      <h1 style={{ fontWeight: '600', fontSize: '2rem', margin: '0.5rem 0' }}>{value}</h1>

      <FlexBetween style={{ gap: '1rem' }}>
        <h1 style={{ fontStyle: 'italic', fontSize: '1.1rem', margin: 0 }}>{increase}</h1>
        <h1 style={{ fontSize: '1rem', margin: 0 }}>{description}</h1>
      </FlexBetween>
    </div>
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
