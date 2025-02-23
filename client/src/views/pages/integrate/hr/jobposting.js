import React, { useState } from 'react';
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
import { useGetJobPostingsQuery, useGetJobPostingByIdQuery } from '../../../../state/hrApi'; // Path to the RTK query API slice
import ActivityTracker from '../../../../util/ActivityTracker'; // Import ActivityTracker

const RecruitmentModule = () => {
  const { data: jobPostings, error, isLoading } = useGetJobPostingsQuery();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityTracked, setActivityTracked] = useState({ jobId: null, jobTitle: null, jobDepartment: null }); // State for tracking activity

  const { data: jobDetails, isLoading: isJobLoading } = useGetJobPostingByIdQuery(selectedJobId, {
    skip: !selectedJobId, // Only fetch details when a job is selected
  });

  const trackActivity = (jobId, action) => {
    const job = jobPostings.find((job) => job._id === jobId);
    const jobTitle = job ? job.title : 'Unknown Job';
    const jobDepartment = job ? job.department : 'Unknown Department';

    // Track the activity
    setActivityTracked({ jobId, jobTitle, jobDepartment });

    // Log the action (optional, for debugging)
    console.log(`${action} job: ${jobTitle}`);
  };

  const viewApplications = (jobId) => {
    setSelectedJobId(jobId);
    setModalVisible(true);
    trackActivity(jobId, 'View');
  };

  const editJob = (jobId) => {
    trackActivity(jobId, 'Edit');
    // Add your edit logic here
    console.log(`Editing job: ${jobId}`);
  };

  const deleteJob = (jobId) => {
    trackActivity(jobId, 'Delete');
    // Add your delete logic here
    console.log(`Deleting job: ${jobId}`);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJobId(null);
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
                    
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Track Activity */}
      {activityTracked.jobId && (
        <ActivityTracker
          action={`Interacted with ${activityTracked.jobTitle}`}
          description={`Interacted with job: ${activityTracked.jobTitle} in the ${activityTracked.jobDepartment} department`}
        />
      )}

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