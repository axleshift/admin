import React, { useState } from 'react';
import { CCard, CCardBody, CCardHeader, CForm, CFormInput, CButton, CAlert, CImage } from '@coreui/react';

const AnnouncementBox = () => {
  const [announcement, setAnnouncement] = useState("🚀 Exciting updates coming soon!");
  const [image, setImage] = useState(null);
  const [showAlert, setShowAlert] = useState(true); 

  const handleTextChange = (e) => {
    setAnnouncement(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); 
    }
  };

  const handlePostAnnouncement = () => {
    if (announcement || image) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000); 
    }
  };

  return (
    <CCard className="mb-3">
      <CCardHeader>📢 Create an Announcement</CCardHeader>
      <CCardBody>
        <CForm>
          {/* Input for announcement text */}
          <CFormInput
            type="text"
            placeholder="Enter your announcement..."
            value={announcement}
            onChange={handleTextChange}
            className="mb-2"
          />

          {/* Input for image upload */}
          <CFormInput
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-3"
          />

          {/* Show preview if an image is uploaded */}
          {image && <CImage fluid src={image} className="mb-3" width={200} alt="Announcement" />}

          {/* Button to post the announcement */}
          <CButton color="primary" onClick={handlePostAnnouncement}>Post Announcement</CButton>
        </CForm>

        {/* Default Announcement Alert */}
        {showAlert && (
          <CAlert color="info" className="mt-3" dismissible>
            {announcement && <p>{announcement}</p>}
            {image && <CImage fluid src={image} width={150} alt="Announcement" />}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  );
};

export default AnnouncementBox;
