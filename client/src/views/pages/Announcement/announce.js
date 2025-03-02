import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CContainer, 
  CRow, 
  CCol, 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CForm, 
  CFormInput, 
  CButton, 
  CFormSelect,
  CSpinner
} from '@coreui/react';

const Announce = () => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('achievement');
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Detect dark mode
  useEffect(() => {
    // Function to check dark mode status
    const checkDarkMode = () => {
      // Check for system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Check for manual setting in localStorage or body class
      const manualDarkMode = localStorage.getItem('darkMode') === 'true' || 
                             document.body.classList.contains('dark-mode');
      
      // Priority: manual setting over system preference
      setIsDarkMode(manualDarkMode !== null ? manualDarkMode : prefersDarkMode);
    };
    
    // Run initial check
    checkDarkMode();
    
    // Set up listener for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if there's no manual override
      if (localStorage.getItem('darkMode') === null && 
          !document.body.classList.contains('dark-mode')) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Add listener with correct API based on browser support
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      darkModeMediaQuery.addListener(handleChange);
    }
    
    // Listen for changes to body class or localStorage
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });
    
    bodyObserver.observe(document.body, { attributes: true });
    
    // Cleanup
    return () => {
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleChange);
      } else {
        darkModeMediaQuery.removeListener(handleChange);
      }
      bodyObserver.disconnect();
    };
  }, []);

  const generateAnnouncement = async () => {
    if (!input.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5053/admin/generate', { input, type });
      setAnnouncement(response.data.announcement);
    } catch (error) {
      console.error('Error generating announcement', error);
      setAnnouncement('Error generating announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic styles based on dark mode
  const darkModeStyles = {
    card: {
      backgroundColor: isDarkMode ? '#1e2837' : null,
      color: isDarkMode ? '#e1e7ef' : null,
      borderColor: isDarkMode ? '#374151' : null
    },
    cardHeader: {
      backgroundColor: isDarkMode ? '#2d3748' : null,
      color: isDarkMode ? '#e1e7ef' : null,
      borderColor: isDarkMode ? '#374151' : null
    },
    formInput: {
      backgroundColor: isDarkMode ? '#374151' : null,
      color: isDarkMode ? '#e1e7ef' : null,
      borderColor: isDarkMode ? '#4b5563' : null
    },
    announcement: {
      backgroundColor: isDarkMode ? '#2d3748' : '#f9fafb',
      color: isDarkMode ? '#e1e7ef' : '#1f2937',
      padding: '15px',
      borderRadius: '4px',
      marginTop: '15px'
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md="8">
          <CCard style={darkModeStyles.card}>
            <CCardHeader style={darkModeStyles.cardHeader}>
              <strong>Announcement Center</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <div className="mb-3">
                  <label className="form-label">Announcement Type</label>
                  <CFormSelect 
                    aria-label="Select Announcement For" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    style={darkModeStyles.formInput}
                  >
                    <option value="achievement">Achievement</option>
                    <option value="event">Event</option>
                    <option value="product">Product</option>
                  </CFormSelect>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Details</label>
                  <CFormInput 
                    type="text" 
                    placeholder="Enter details for your announcement" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    style={darkModeStyles.formInput}
                  />
                </div>
                
                <CButton 
                  color={isDarkMode ? "light" : "primary"} 
                  onClick={generateAnnouncement} 
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> 
                      Generating...
                    </>
                  ) : "Generate Announcement"}
                </CButton>
              </CForm>
              
              {announcement && (
                <div style={darkModeStyles.announcement} className="mt-3">
                  <h4 className={isDarkMode ? "text-light" : "text-dark"}>Generated Announcement:</h4>
                  <p className="mb-0">{announcement}</p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Announce;