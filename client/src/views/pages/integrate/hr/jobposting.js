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
  CToaster
} from '@coreui/react';
import { useGetJobPostingsQuery } from '../../../../state/hrApi';
import logActivity from '../../../../utils/activityLogger';
const RecruitmentModule = () => {
  const { data: jobPostingsResponse, error, isLoading, isSuccess } = useGetJobPostingsQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name'); 
  const [toast, setToast] = useState(null);
  const [toaster, setToaster] = useState(null);

 logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: 'jobpost',
      action: 'Page Visit',
      description: `${userName} visit the JobPost page`
    }).catch(console.warn);

  // Show toast notification when data is successfully fetched
  useEffect(() => {
    if (isSuccess && jobPostingsResponse) {
      setToast(
        <CToast autohide={true} delay={5000}>
          <CToastHeader closeButton>
            <strong className="me-auto">Success</strong>
          </CToastHeader>
          <CToastBody>
            Successfully loaded {jobPostingsResponse?.count || jobPostingsResponse?.data?.length || 0} job postings!
          </CToastBody>
        </CToast>
      );
    }
  }, [isSuccess, jobPostingsResponse]);

  // Extract jobPostings from the response structure
  const jobPostings = jobPostingsResponse?.data || [];

  const viewJobDetails = async (job) => {
    setSelectedJob(job);
    setModalVisible(true);
    
    try {
      // Log activity when user views job details
      await 
      logActivity({
         name: userName,
         role: userRole,
         department: userDepartment,
         route: 'jobposting',
         action: 'Click',
         description: `${userName} viewed details for job: ${job.title}`
       }).catch(console.warn);
       

      // Create notification
      const title = "Job Details Viewed";
      const message = `${userName} (${userRole}) viewed details for job: ${job.title}`;
      
     
    } catch (error) {
      console.warn("Error logging activity or showing notification:", error);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Toaster component to show notifications */}
      <CToaster ref={setToaster} push={toast} placement="top-end" />

      <CCard className="mb-4 shadow">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <span className="h4 m-0">Job Postings</span>
          </div>
        </CCardHeader>
        <CCardBody>
          {isLoading ? (
            <div className="text-center p-5">
              <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
              <div className="mt-3">Loading job postings...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Error loading job postings:</strong> {error.toString()}
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-light rounded">
                Total Job Postings: <strong>{jobPostingsResponse?.count || jobPostings.length || 0}</strong>
              </div>
              <CTable striped hover responsive className="border">
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Job Title</CTableHeaderCell>
                    <CTableHeaderCell>Author</CTableHeaderCell>
                    <CTableHeaderCell>Category</CTableHeaderCell>
                    <CTableHeaderCell>Capacity</CTableHeaderCell>
                    <CTableHeaderCell>Posted Date</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {jobPostings.length > 0 ? (
                    jobPostings.map((job) => (
                      <CTableRow key={job._id}>
                        <CTableDataCell className="fw-bold">{job.title}</CTableDataCell>
                        <CTableDataCell>{job.author}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getCategoryBadgeColor(job.category)} shape="rounded-pill" className="px-3 py-2">
                            {job.category}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{job.capacity}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.createdAt)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="primary" size="sm" onClick={() => viewJobDetails(job)}>
                            View Details
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center py-5">
                        <div className="text-muted mb-2">No job postings found</div>
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
            Job Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="px-4 py-4">
          {selectedJob ? (
            <div className="job-details">
              <CCardTitle className="mb-1 h3">{selectedJob.title}</CCardTitle>
              <CCardSubtitle className="mb-3 text-muted">
                <div className="d-flex align-items-center mb-2">
                  Posted by: <strong className="ms-1">{selectedJob.author}</strong>
                  <span className="mx-2">|</span>
                  {formatDate(selectedJob.createdAt)}
                </div>
                <CBadge color={getCategoryBadgeColor(selectedJob.category)} shape="rounded-pill" className="px-3 py-2">
                  {selectedJob.category}
                </CBadge>
              </CCardSubtitle>
              
              <CRow className="mt-4">
                <CCol>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardBody>
                      <h5 className="card-title text-primary">Responsibilities</h5>
                      <CCardText>{selectedJob.responsibilities || "No responsibilities specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <CRow className="mt-4">
                <CCol md={6}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardBody>
                      <h5 className="card-title text-primary">Requirements</h5>
                      <CCardText>{selectedJob.requirements || "No requirements specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={6}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardBody>
                      <h5 className="card-title text-primary">Qualifications</h5>
                      <CCardText>{selectedJob.qualifications || "No qualifications specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              
              <CRow className="mt-4">
                <CCol md={8}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardBody>
                      <h5 className="card-title text-primary">Benefits</h5>
                      <CCardText>{selectedJob.benefits || "No benefits specified."}</CCardText>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={4}>
                  <CCard className="h-100 shadow-sm border-0">
                    <CCardBody>
                      <h5 className="card-title text-primary">Capacity</h5>
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
                  <CCardBody>
                    <h5 className="card-title text-primary">Applications</h5>
                    <CTable striped hover className="mt-3">
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
                              }>
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