import React, { useState } from 'react';
import axios from 'axios';
import { CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CForm, CFormInput, CButton, CFormSelect } from '@coreui/react';

const Announce = () => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('achievement');
  const [announcement, setAnnouncement] = useState('');

  const generateAnnouncement = async () => {
    try {
      const response = await axios.post('http://localhost:5053/admin/generate', { input, type });
      setAnnouncement(response.data.announcement);
    } catch (error) {
      console.error('Error generating announcement', error);
      setAnnouncement('Error generating announcement');
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md="8">
          <CCard>
            <CCardHeader>Announcement Center</CCardHeader>
            <CCardBody>
              <CForm>
                <CFormSelect aria-label="Select Announcement For" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="achievement">Achievement</option>
                  <option value="event">Event</option>
                  <option value="product">Product</option>
                </CFormSelect>
                <CFormInput 
                  type="text" 
                  placeholder="Enter Detail" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  className="mt-2" 
                />
                <CButton color="primary" onClick={generateAnnouncement} className="mt-2">Generate</CButton>
              </CForm>
              {announcement && (
                <div className="mt-3">
                  <h3>Announcement:</h3>
                  <p>{announcement}</p>
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
