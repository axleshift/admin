import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilChevronLeft, 
  cilChevronRight 
} from '@coreui/icons';
import { useSelector } from 'react-redux';

const AnnouncementList = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageAspects, setImageAspects] = useState({});
    const isDarkMode = useSelector((state) => state.changeState.theme === 'dark');

    const fetchAnnouncements = async () => {
        try {
            const response = await axios.get(`http://localhost:5053/management/getannounce?page=1&limit=10`);
            setAnnouncements(response.data.announcements || []);
        } catch (error) {
            console.error('Failed to fetch announcements:', error.message);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Load image information for proper sizing
    useEffect(() => {
        announcements.forEach(announcement => {
            if (announcement.banner) {
                const img = new Image();
                img.onload = () => {
                    setImageAspects(prev => ({
                        ...prev,
                        [announcement._id]: {
                            width: img.width,
                            height: img.height,
                            aspectRatio: img.width / img.height
                        }
                    }));
                };
                img.src = `http://localhost:5053/uploads/${announcement.banner}`;
            }
        });
    }, [announcements]);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="position-relative mx-4">
            {announcements.length > 0 ? (
                <>
                    <CCard className="mx-auto w-100">
                        <CCardHeader className="d-flex justify-content-between align-items-center">
                            <div>{announcements[currentIndex].title}</div>
                            <div className="small text-muted">
                                {currentIndex + 1} / {announcements.length}
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <p>{announcements[currentIndex].message}</p>
                            
                            {announcements[currentIndex].banner && (
                                <div className="d-flex justify-content-center">
                                    <div className="image-container" style={{ 
                                        overflow: 'hidden',
                                        maxWidth: '100%'
                                    }}>
                                        <img 
                                            src={`http://localhost:5053/uploads/${announcements[currentIndex].banner}`} 
                                            alt="Banner" 
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block'
                                            }}
                                            onLoad={(e) => {
                                                // Ensure image maintains original dimensions
                                                const img = e.target;
                                                if (imageAspects[announcements[currentIndex]._id]) {
                                                    const containerWidth = img.parentElement.offsetWidth;
                                                    const naturalWidth = imageAspects[announcements[currentIndex]._id].width;
                                                    
                                                    // If natural width is smaller than container, use natural size
                                                    if (naturalWidth < containerWidth) {
                                                        img.style.width = naturalWidth + 'px';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <small className="d-block mt-3">
                                Posted on: {new Date(announcements[currentIndex].createdAt).toLocaleString()}
                            </small>
                        </CCardBody>
                    </CCard>

                    {/* Previous button using CButton */}
                    <CButton 
                        onClick={goToPrevious}
                        className="position-absolute top-50 start-0 translate-middle-y rounded-circle p-0"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: isDarkMode ? '#495057' : '#e9ecef',
                            color: isDarkMode ? '#fff' : '#212529',
                            border: isDarkMode ? '1px solid #6c757d' : '1px solid #ced4da',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            opacity: 0.9,
                            zIndex: 1000
                        }}
                        aria-label="Previous announcement"
                    >
                        <CIcon icon={cilChevronLeft} />
                    </CButton>

                    {/* Next button using CButton */}
                    <CButton 
                        onClick={goToNext}
                        className="position-absolute top-50 end-0 translate-middle-y rounded-circle p-0"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: isDarkMode ? '#495057' : '#e9ecef',
                            color: isDarkMode ? '#fff' : '#212529',
                            border: isDarkMode ? '1px solid #6c757d' : '1px solid #ced4da',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            opacity: 0.9,
                            zIndex: 1000
                        }}
                        aria-label="Next announcement"
                    >
                        <CIcon icon={cilChevronRight} />
                    </CButton>
                </>
            ) : (
                <p>No announcements found.</p>
            )}
        </div>
    );
};

export default AnnouncementList;