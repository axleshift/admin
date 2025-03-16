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
} from '@coreui/react';
import { useGetJobPostingsQuery, useGetJobPostingByIdQuery } from '../../../../state/hrApi';
import logActivity from '../../../../utils/ActivityLogger'; // Import the logActivity function

const RecruitmentModule = () => {
  const { data: jobPostings, error, isLoading } = useGetJobPostingsQuery();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    department: '',
    userId: ''
  });

  // Get user information from sessionStorage on component mount
  useEffect(() => {
    setUserInfo({
      name: sessionStorage.getItem('name'),
      role: sessionStorage.getItem('role'),
      department: sessionStorage.getItem('department'),
      userId: sessionStorage.getItem('userId')
    });
  }, []);

  const { data: jobDetails, isLoading: isJobLoading } = useGetJobPostingByIdQuery(selectedJobId, {
    skip: !selectedJobId, // Only fetch details when a job is selected
  });

  const viewApplications = (jobId) => {
    setSelectedJobId(jobId);
    setModalVisible(true);
    
    // Track activity
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/recruitment/job-postings',
      action: 'View Applications',
      description: `User viewed applications for job ID: ${jobId}`
    });
  };

  const editJob = (jobId) => {
    // Track activity
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/recruitment/job-postings',
      action: 'Edit Job',
      description: `User initiated editing for job ID: ${jobId}`
    });
    
    // Add your edit logic here
    console.log(`Editing job: ${jobId}`);
  };

  const deleteJob = (jobId) => {
    // Track activity
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/recruitment/job-postings',
      action: 'Delete Job',
      description: `User deleted job ID: ${jobId}`
    });
    
    // Add your delete logic here
    console.log(`Deleting job: ${jobId}`);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJobId(null);
    
    // Track activity
    logActivity({
      name: userInfo.name,
      role: userInfo.role,
      department: userInfo.department,
      route: '/recruitment/job-postings',
      action: 'Close Modal',
      description: 'User closed the applications modal'
    });
  };

  return (
    <div>
      <CCard className="mb-4">
        <CCardHeader>
          <h4>Job Postings</h4>
        </CCardHeader>
        <CCardBody>
          {isLoading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <div>Error loading job postings</div>
          ) : (
            <CTable striped hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Job Title</CTableHeaderCell>
                  <CTableHeaderCell>Department</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Applications</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {jobPostings.map((job) => (
                  <CTableRow key={job._id}>
                    <CTableDataCell>{job.title}</CTableDataCell>
                    <CTableDataCell>{job.department}</CTableDataCell>
                    <CTableDataCell>{job.location}</CTableDataCell>
                    <CTableDataCell>{job.status}</CTableDataCell>
                    <CTableDataCell>
                      {job.applicationsCount}{' '}
                      <CButton color="info" size="sm" onClick={() => viewApplications(job._id)}>
                        View
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" size="sm" className="me-2" onClick={() => editJob(job._id)}>
                        Edit
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => deleteJob(job._id)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal to view applications */}
      <CModal visible={modalVisible} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>Applications</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {isJobLoading ? (
            <CSpinner color="primary" />
          ) : jobDetails ? (
            <>
              <h5>Applicants for {jobDetails.title}</h5>
              {jobDetails.applications && jobDetails.applications.length > 0 ? (
                <CTable striped hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Applicant Name</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {jobDetails.applications.map((application) => (
                      <CTableRow key={application._id}>
                        <CTableDataCell>{application.applicantName}</CTableDataCell>
                        <CTableDataCell>{application.status}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <div>No applications found for this job.</div>
              )}
            </>
          ) : (
            <div>Error loading job details.</div>
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