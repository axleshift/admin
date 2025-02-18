import React, { useState, useEffect } from 'react';
import FlexBetween from './FlexBetween';
import PropTypes from 'prop-types';

const StatBox = ({ title, value, increase, icon, description }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if dark mode is enabled in localStorage or by inspecting body class
  useEffect(() => {
    const darkModeStatus = localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('dark-mode');
    setIsDarkMode(darkModeStatus);
  }, []);

  return (
    <div
      style={{
        flex: '1 1 100%',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: isDarkMode 
          ? '0 8px 16px rgba(0, 0, 0, 0.25)' 
          : '0 6px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#333333',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '10px',
        minWidth: '250px',
        height: '100%',
        transition: 'all 0.3s ease',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      }}
    >
      <FlexBetween>
        <h1 
          style={{ 
            fontSize: '1.1rem', 
            margin: 0, 
            fontWeight: '500',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            letterSpacing: '0.025em'
          }}
        >
          {title}
        </h1>
        <div style={{ 
          background: isDarkMode ? '#374151' : '#f3f4f6', 
          padding: '0.65rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { 
            style: { 
              ...icon.props.style, 
              color: isDarkMode ? '#60a5fa' : '#3b82f6' 
            } 
          })}
        </div>
      </FlexBetween>

      <h1 
        style={{ 
          fontWeight: '600', 
          fontSize: '2rem', 
          margin: '0.75rem 0',
          color: isDarkMode ? '#f9fafb' : '#111827',
        }}
      >
        {value}
      </h1>

      <FlexBetween style={{ gap: '1rem' }}>
        <h1 
          style={{ 
            fontStyle: 'italic', 
            fontSize: '1.1rem', 
            margin: 0,
            color: increase.includes('+') ? '#10b981' : '#ef4444',
            fontWeight: '500',
          }}
        >
          {increase}
        </h1>
        <h1 
          style={{ 
            fontSize: '0.9rem', 
            margin: 0,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontWeight: '400',
          }}
        >
          {description}
        </h1>
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