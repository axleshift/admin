import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CButton, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CForm, 
  CFormInput, 
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faChevronLeft, faChevronRight, faMagic, faDownload, faCheck, faSync, faTrash } from '@fortawesome/free-solid-svg-icons';

const AnnouncementPage = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [banner, setBanner] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // AI banner generation states
    const [showAiModal, setShowAiModal] = useState(false);
    const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
    const [generatedBannerUrl, setGeneratedBannerUrl] = useState('');
    const [generatedBannerFilename, setGeneratedBannerFilename] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [error, setError] = useState(null);
    
    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const announcementsPerPage = 5;
    const apiBaseUrl = import.meta.env.VITE_APP_BASE_URL;

    const fetchAnnouncements = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/management/getannounce?page=${currentPage}&limit=${announcementsPerPage}`);
            setAnnouncements(response.data.announcements || []);
            setTotalPages(response.data.totalPages || 1);
            setActiveIndex(0);
        } catch (error) {
            console.error('Failed to fetch announcements:', error.message);
            setAnnouncements([]);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, [currentPage]);

    const handlePrevious = () => {
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    };

    const handleNext = () => {
        if (activeIndex < announcements.length - 1) setActiveIndex(activeIndex + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSubmitting(true);
        
        try {
            // Create FormData object to handle file upload
            const formData = new FormData();
            formData.append('title', title);
            formData.append('message', message);
            if (banner) {
                formData.append('banner', banner);
            }
            
            // Send POST request to create announcement
            await axios.post(`${apiBaseUrl}/management/announcement`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Reset form fields
            setTitle('');
            setMessage('');
            setBanner(null);
            setShowForm(false);
            setGeneratedBannerUrl('');
            setGeneratedBannerFilename('');
            
            // Refresh announcements list
            fetchAnnouncements();
            
        } catch (error) {
            console.error('Failed to create announcement:', error);
            setError('Failed to create announcement. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete announcement function
    const handleDeleteAnnouncement = async () => {
        if (!announcements.length || activeIndex < 0) return;
        
        const announcementId = announcements[activeIndex]._id;
        setIsDeleting(true);
        
        try {
            await axios.delete(`${apiBaseUrl}/management/delannounce/${announcementId}`);
            
            // Close delete modal
            setShowDeleteModal(false);
            
            // Refresh announcements list and adjust active index if needed
            await fetchAnnouncements();
            
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            setError('Failed to delete announcement. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    // Confirm before deleting
    const confirmDelete = () => {
        setShowDeleteModal(true);
        setError(null);
    };

    // Open AI banner modal with initial prompt
    const openAiBannerModal = () => {
        setAiPrompt(title); // Use the title as the initial prompt
        setShowAiModal(true);
        setError(null);
        setGeneratedBannerUrl('');
    };

    // Generate AI banner with custom prompt
    const generateAiBanner = async () => {
        if (!aiPrompt) {
            setError('Please enter a description for your banner');
            return;
        }
        
        setIsGeneratingBanner(true);
        setGeneratedBannerUrl('');
        setError(null);
        
        try {
            const response = await axios.post(`${apiBaseUrl}/management/generate-banner`, {
                prompt: aiPrompt // Use the custom prompt instead of title
            });
            
            if (response.data.success) {
                setGeneratedBannerUrl(response.data.bannerUrl);
                setGeneratedBannerFilename(response.data.banner);
                
                // Create a file object from the generated banner
                const response2 = await fetch(`${apiBaseUrl}${response.data.bannerUrl}`);
                const blob = await response2.blob();
                const file = new File([blob], response.data.banner, { type: 'image/png' });
                setBanner(file);
            } else {
                setError('Failed to generate banner');
            }
        } catch (error) {
            console.error('Failed to generate AI banner:', error);
            setError(error.response?.data?.message || 'Failed to generate banner. Please try again.');
        } finally {
            setIsGeneratingBanner(false);
        }
    };

    // Download generated banner
    const downloadBanner = () => {
        if (!generatedBannerUrl) return;
        
        const link = document.createElement('a');
        link.href = `${apiBaseUrl}${generatedBannerUrl}`;
        link.download = generatedBannerFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Use the generated banner and close modal
    const useGeneratedBanner = () => {
        setShowAiModal(false);
        // The banner is already set in state from the generateAiBanner function
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h1>Announcements</h1>
                <CButton color="primary" onClick={() => setShowForm(!showForm)}>
                    <FontAwesomeIcon icon={faUpload} /> Upload New Announcement
                </CButton>
            </div>

            {showForm && (
                <CCard className="mb-4">
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}
                        <CForm onSubmit={handleSubmit}>
                            <CFormInput 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                placeholder="Title" 
                                required 
                                className="mb-3" 
                            />
                            <CFormTextarea 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                placeholder="Message" 
                                required 
                                className="mb-3" 
                            />
                            <div className="d-flex align-items-center mb-3">
                                <CFormInput 
                                    type="file" 
                                    onChange={(e) => setBanner(e.target.files[0])} 
                                    className="me-3" 
                                />
                                <CButton 
                                    color="info" 
                                    onClick={openAiBannerModal}
                                >
                                    <FontAwesomeIcon icon={faMagic} /> Generate Banner
                                </CButton>
                            </div>
                            {banner && (
                                <div className="mb-3">
                                    <p>Selected banner: {typeof banner === 'string' ? banner : banner.name}</p>
                                    {generatedBannerUrl && (
                                        <img 
                                            src={`${apiBaseUrl}${generatedBannerUrl}`} 
                                            alt="Generated Banner" 
                                            className="img-fluid mt-2" 
                                            style={{ maxHeight: '200px' }}
                                        />
                                    )}
                                </div>
                            )}
                            <CButton 
                                type="submit" 
                                color="success" 
                                disabled={isSubmitting || !title || !message}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Announcement'}
                            </CButton>
                        </CForm>
                    </CCardBody>
                </CCard>
            )}

            {/* AI Banner Generation Modal */}
            <CModal 
              visible={showAiModal} 
              onClose={() => setShowAiModal(false)}
              size="lg" // Make modal larger for better preview
              alignment="center"
            >
              <CModalHeader className="bg-gradient-primary text-white">
                <CModalTitle>
                  <FontAwesomeIcon icon={faMagic} className="me-2" /> AI Banner Generator
                </CModalTitle>
              </CModalHeader>
              <CModalBody className="p-4">
                {isGeneratingBanner ? (
                  <div className="text-center py-5">
                    <div className="position-relative">
                      {/* Animated placeholder while generating */}
                      <div 
                        className="placeholder-banner rounded mb-4" 
                        style={{
                          height: "200px", 
                          background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
                          backgroundSize: "400% 400%",
                          animation: "gradient 3s ease infinite",
                          position: "relative"
                        }}
                      >
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <CSpinner color="light" size="lg" />
                        </div>
                      </div>
                      <style>
                        {`
                          @keyframes gradient {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                          }
                        `}
                      </style>
                    </div>
                    <h4 className="mt-3">Creating Your Banner</h4>
                    <p className="text-muted">
                      Generating a professional design with AI. This usually takes 10-15 seconds...
                    </p>
                  </div>
                ) : generatedBannerUrl ? (
                  <div className="text-center">
                    <div className="mb-3">
                      <h4 className="mb-3">Your Custom Banner</h4>
                      <div className="banner-preview shadow rounded overflow-hidden">
                        <img 
                          src={`${apiBaseUrl}${generatedBannerUrl}`} 
                          alt="Generated Banner" 
                          className="img-fluid w-100" 
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <CButton color="success" className="px-4" onClick={useGeneratedBanner}>
                        <FontAwesomeIcon icon={faCheck} className="me-2" /> Use This Banner
                      </CButton>
                      <CButton color="info" onClick={downloadBanner}>
                        <FontAwesomeIcon icon={faDownload} className="me-2" /> Download
                      </CButton>
                      <CButton color="secondary" onClick={() => {
                        setGeneratedBannerUrl('');
                        setGeneratedBannerFilename('');
                      }}>
                        <FontAwesomeIcon icon={faSync} className="me-2" /> Create Another
                      </CButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    {error && <CAlert color="danger">{error}</CAlert>}
                    
                    <div className="banner-generation-form">
                      <h4 className="mb-3">Design Your Announcement Banner</h4>
                      
                      <div className="mb-4">
                        <label className="form-label fw-bold">What would you like your banner to say?</label>
                        <CFormInput 
                          type="text" 
                          value={aiPrompt} 
                          onChange={(e) => setAiPrompt(e.target.value)} 
                          placeholder="E.g., Company anniversary celebration with fireworks" 
                          className="form-control-lg mb-2" 
                        />
                        <div className="form-text text-muted">
                          Tip: Be specific about colors, style, and mood for better results
                        </div>
                      </div>
                      
                      {/* Optional: Add template selection */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Choose a Style (Optional)</label>
                        <div className="d-flex gap-3 overflow-auto pb-2">
                          <div 
                            className="style-option p-2 border rounded text-center cursor-pointer"
                            style={{
                              minWidth: "120px",
                              background: "linear-gradient(135deg, #1a3a8f 0%, #0f2557 100%)",
                              color: "white"
                            }}
                            onClick={() => setAiPrompt(p => `${p} in corporate blue style`)}
                          >
                            <div className="py-3">Corporate</div>
                          </div>
                          <div 
                            className="style-option p-2 border rounded text-center cursor-pointer"
                            style={{
                              minWidth: "120px", 
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white"
                            }}
                            onClick={() => setAiPrompt(p => `${p} in modern purple gradient style`)}
                          >
                            <div className="py-3">Modern</div>
                          </div>
                          <div 
                            className="style-option p-2 border rounded text-center cursor-pointer"
                            style={{
                              minWidth: "120px",
                              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                              color: "white"
                            }}
                            onClick={() => setAiPrompt(p => `${p} in fresh green style`)}
                          >
                            <div className="py-3">Fresh</div>
                          </div>
                          <div 
                            className="style-option p-2 border rounded text-center cursor-pointer"
                            style={{
                              minWidth: "120px",
                              background: "linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)",
                              color: "white"
                            }}
                            onClick={() => setAiPrompt(p => `${p} in warm orange style`)}
                          >
                            <div className="py-3">Warm</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <CButton 
                          color="primary" 
                          size="lg"
                          className="px-5"
                          onClick={generateAiBanner}
                          disabled={!aiPrompt}
                        >
                          <FontAwesomeIcon icon={faMagic} className="me-2" /> Generate Banner
                        </CButton>
                      </div>
                    </div>
                  </div>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowAiModal(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Delete Confirmation Modal */}
            <CModal 
              visible={showDeleteModal} 
              onClose={() => setShowDeleteModal(false)}
              alignment="center"
            >
              <CModalHeader>
                <CModalTitle>
                  <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" /> Confirm Deletion
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                {announcements.length > 0 && activeIndex >= 0 && (
                  <>
                    <p>Are you sure you want to delete this announcement?</p>
                    <div className="alert alert-warning">
                      <strong>{announcements[activeIndex].title}</strong>
                      <p className="mb-0 mt-2">This action cannot be undone.</p>
                    </div>
                  </>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </CButton>
                <CButton 
                  color="danger" 
                  onClick={handleDeleteAnnouncement}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
                    </>
                  )}
                </CButton>
              </CModalFooter>
            </CModal>

            {announcements.length > 0 ? (
                <CCard className="mb-3">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <CButton color="secondary" onClick={handlePrevious} disabled={activeIndex === 0}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </CButton>
                        <h4 className="m-0">{announcements[activeIndex].title}</h4>
                        <div className="d-flex">
                            <CButton 
                                color="danger" 
                                className="me-2" 
                                onClick={confirmDelete}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </CButton>
                            <CButton 
                                color="secondary" 
                                onClick={handleNext} 
                                disabled={activeIndex === announcements.length - 1}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <p>{announcements[activeIndex].message}</p>
                        {announcements[activeIndex].banner && (
                            <img src={`${apiBaseUrl}/uploads/${announcements[activeIndex].banner}`} alt="Banner" className="mt-2 img-fluid" />
                        )}
                        <small>Posted on: {new Date(announcements[activeIndex].createdAt).toLocaleString()}</small>
                    </CCardBody>
                </CCard>
            ) : (
                <p>No announcements found.</p>
            )}
        </div>
    );
};

export default AnnouncementPage;