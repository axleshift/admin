import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CCardTitle,
  CCardSubtitle,
  CCardText,
  CRow,
  CCol,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, 
  faCheckCircle,
  faSearch,
  faFilter,
  faSyncAlt,
  faCalendarAlt,
  faUserTie,
  faTag,
  faClipboardList,
  faBuilding,
  faUserPlus,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useGetJobPostingsQuery } from '../../../../state/hrApi';
import logActivity from '../../../../utils/activityLogger';

const RecruitmentModule = () => {
  const { data: jobPostingsResponse, error, isLoading, isSuccess, refetch } = useGetJobPostingsQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name'); 
  const [toast, setToast] = useState(null);
  const [toaster, setToaster] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');

  // Log page visit activity
  useEffect(() => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: 'jobpost',
      action: 'Page Visit',
      description: `${userName} visited the Job Postings page`
    }).catch(console.warn);
  }, [userName, userRole, userDepartment]);

  // Extract jobPostings from the response structure
  const jobPostings = jobPostingsResponse?.data || [];

  // Show toast notification when data is successfully fetched
  useEffect(() => {
    if (isSuccess && jobPostingsResponse) {
      setToast(
        <CToast autohide={true} delay={3000}>
          <CToastHeader closeButton>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
            <strong className="me-auto text-success">Data Loaded</strong>
          </CToastHeader>
          <CToastBody>
            Successfully loaded {jobPostingsResponse?.count || jobPostingsResponse?.data?.length || 0} job postings!
          </CToastBody>
        </CToast>
      );
      
      // Initialize filtered jobs with all jobs
      setFilteredJobs(jobPostings);
    }
  }, [isSuccess, jobPostingsResponse, jobPostings]);

  // Update filtered jobs when search term or filter category changes
  useEffect(() => {
    let filtered = jobPostings;
    
    // Apply category filter if set
    if (filterCategory) {
      filtered = filtered.filter(job => 
        job.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requirements?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.responsibilities?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, filterCategory, jobPostings]);

  const viewJobDetails = async (job) => {
    setSelectedJob(job);
    setModalVisible(true);
    
    try {
      // Log activity when user views job details
      await logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: 'jobposting',
        action: 'Click',
        description: `${userName} viewed details for job: ${job.title}`
      }).catch(console.warn);
    } catch (error) {
      console.warn("Error logging activity:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  // Function to get category badge color
  const getCategoryBadgeColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'fulltime':
      case 'full-time':
        return 'success';
      case 'parttime':
      case 'part-time':
        return 'info';
      case 'contract':
        return 'warning';
      case 'internship':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Extract unique categories for filter dropdown
  const uniqueCategories = [...new Set(jobPostings.map(job => job.category))].filter(Boolean);

  return (
    <div>
      {/* Toaster component to show notifications */}
      <CToaster ref={setToaster} push={toast} placement="top-end" />
      
      <CCard className="mb-4 shadow border-0">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
            <span className="h4 m-0">Job Postings</span>
          </div>
          <CButton 
            color="light" 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            title="Refresh job postings"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </CButton>
        </CCardHeader>
        
        <CCardBody>
          {isLoading ? (
            <div className="text-center p-5">
              <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
              <div className="mt-3 text-muted">Loading job postings...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex align-items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <div>
                <strong>Error loading job postings:</strong> {error.toString()}
              </div>
            </div>
          ) : (
            <>
              {/* Search and Filter Controls */}
              <div className="mb-4">
                <CRow className="align-items-center">
                <CCol md={4}>
                    <CCard className="h-100 shadow-sm">
                      <CCardBody className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faBriefcase} className="text-primary fs-3 me-3" />
                        <div>
                          <div className="text-muted small">Total Job Postings</div>
                          <div className="fs-4 fw-semibold">
                            {jobPostingsResponse?.count || jobPostings.length || 0}
                          </div>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>

                  <CCol md={8}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Search job postings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <CButton type="button" color="primary">
                        <FontAwesomeIcon icon={faSearch} />
                      </CButton>
                      <CDropdown variant="btn-group">
                        <CDropdownToggle color="primary" variant="outline">
                          <FontAwesomeIcon icon={faFilter} className="me-1" />
                          {filterCategory || 'All Categories'}
                        </CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem onClick={() => setFilterCategory('')}>
                            All Categories
                          </CDropdownItem>
                          {uniqueCategories.map((category) => (
                            <CDropdownItem 
                              key={category} 
                              onClick={() => setFilterCategory(category)}
                            >
                              {category}
                            </CDropdownItem>
                          ))}
                        </CDropdownMenu>
                      </CDropdown>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </div>
              
              {/* Job Postings Table */}
              <CTable striped hover responsive className="border shadow-sm">
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>
                      <FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" /> Job Title
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <FontAwesomeIcon icon={faUserTie} className="me-2 text-primary" /> Author
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <FontAwesomeIcon icon={faTag} className="me-2 text-primary" /> Category
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <FontAwesomeIcon icon={faUserPlus} className="me-2 text-primary" /> Capacity
                    </CTableHeaderCell>
                    <CTableHeaderCell>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" /> Posted Date
                    </CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <CTableRow key={job._id} className="align-middle">
                        <CTableDataCell className="fw-bold">{job.title}</CTableDataCell>
                        <CTableDataCell>{job.author}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge 
                            color={getCategoryBadgeColor(job.category)} 
                            shape="rounded-pill" 
                            className="px-3 py-2"
                          >
                            {job.category}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">{job.capacity}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.createdAt)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton 
                            color="primary" 
                            size="sm" 
                            onClick={() => viewJobDetails(job)}
                            className="px-3"
                          >
                            View Details
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center py-5">
                        <FontAwesomeIcon icon={faBriefcase} size="3x" className="text-muted mb-3" />
                        <div className="h5 text-muted mb-2">No job postings found</div>
                        <div className="text-muted small">
                          {searchTerm || filterCategory ? 
                            "Try adjusting your search or filter criteria" : 
                            "No job postings are currently available"}
                        </div>
                        {(searchTerm || filterCategory) && (
                          <CButton 
                            color="primary" 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => {
                              setSearchTerm('');
                              setFilterCategory('');
                            }}
                          >
                            Clear Filters
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </>
          )}
        </CCardBody>
      </CCard>
      
      {/* Modal to view job details */}
      <CModal visible={modalVisible} onClose={closeModal} size="lg">
        <CModalHeader className="bg-primary text-white">
          <CModalTitle>
            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
            Job Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 py-4">
          {selectedJob ? (
            <div className="job-details">
              <CCardTitle className="mb-1 h3">{selectedJob.title}</CCardTitle>
              <CCardSubtitle className="mb-3 text-muted">
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faUserTie} className="me-2 text-primary" />
                  Posted by: <strong className="ms-1">{selectedJob.author}</strong>
                  <span className="mx-2">|</span>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-primary" />
                  {formatDate(selectedJob.createdAt)}
                </div>
                <CBadge color={getCategoryBadgeColor(selectedJob.category)} shape="rounded-pill" className="px-3 py-2">
                  {selectedJob.category}
                </CBadge>
              </CCardSubtitle>
              
              <CRow className="mt-4">
                <CCol>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardHeader className="bg-light border-0">
                      <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
                      <strong>Responsibilities</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CCardText>{selectedJob.responsibilities || "No responsibilities specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <CRow className="mt-4">
                <CCol md={6}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardHeader className="bg-light border-0">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-primary" />
                      <strong>Requirements</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CCardText>{selectedJob.requirements || "No requirements specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={6}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardHeader className="bg-light border-0">
                      <FontAwesomeIcon icon={faUserTie} className="me-2 text-primary" />
                      <strong>Qualifications</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CCardText>{selectedJob.qualifications || "No qualifications specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <CRow className="mt-4">
                <CCol md={8}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardHeader className="bg-light border-0">
                      <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                      <strong>Benefits</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CCardText>{selectedJob.benefits || "No benefits specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={4}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardHeader className="bg-light border-0">
                      <FontAwesomeIcon icon={faUserPlus} className="me-2 text-primary" />
                      <strong>Capacity</strong>
                    </CCardHeader>
                    <CCardBody>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                          <div className="display-4 fw-bold text-primary">{selectedJob.capacity}</div>
                          <div className="text-muted">position(s)</div>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              {/* Applications section - kept but may not exist in your current data model */}
              {selectedJob.applications && selectedJob.applications.length > 0 && (
                <CCard className="mt-4 shadow-sm border-0">
                  <CCardHeader className="bg-light border-0">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2 text-primary" />
                    <strong>Applications</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CTable striped hover className="mt-3 border">
                      <CTableHead className="bg-light">
                        <CTableRow>
                          <CTableHeaderCell>Applicant Name</CTableHeaderCell>
                          <CTableHeaderCell>Status</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {selectedJob.applications.map((application) => (
                          <CTableRow key={application._id}>
                            <CTableDataCell>{application.applicantName}</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={
                                application.status === 'Approved' ? 'success' :
                                application.status === 'Rejected' ? 'danger' :
                                application.status === 'Pending' ? 'warning' : 'info'
                              } shape="rounded-pill" className="px-3 py-2">
                                {application.status}
                              </CBadge>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CCardBody>
                </CCard>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <div className="mt-3">Loading job details...</div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default RecruitmentModule;