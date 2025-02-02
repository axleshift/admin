import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol, CCard } from '@coreui/react';
import { useGethrdashQuery, useGetJobPostingsQuery, useGetpayrollQuery } from '../../state/api';

const Hrdash = () => {
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGethrdashQuery();
  const { data: jobPostings, error: jobPostingsError, isLoading: jobPostingsLoading } = useGetJobPostingsQuery();
  const { data: payrollData, error: payrollError, isLoading: payrollLoading } = useGetpayrollQuery();

  // Debugging: Log payroll data
  console.log('Payroll Data:', payrollData);

  // Loading or error states
  if (dashboardLoading || jobPostingsLoading || payrollLoading) return <p>Loading...</p>;
  if (dashboardError || jobPostingsError || payrollError) return <p>Error fetching data</p>;

  return (
    <CContainer fluid className="p-3">
      <CRow>
        <CCol xs={12}>
          <CustomHeader title="HR Dashboard" subtitle="Welcome to the HR Dashboard" />
        </CCol>
      </CRow>

      {/* StatBox and Job Postings Side by Side */}
      <CRow className="my-3">
        {/* StatBox Section */}
        <CCol xs={12} lg={6} className="mb-3">
          <StatBox
            title="Total Employees"
            value={dashboardData?.totalWorkers}
            increase="+14%"
            description="Since last month"
            icon={<FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '20px', color: '#ffc107' }} />}
          />
        </CCol>

        {/* Job Postings Section */}
        <CCol xs={12} lg={6}>
          <CCard>
            <h5 className="p-3">Job Postings</h5>
            {/* Responsive Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostings?.map((job, index) => (
                    <tr key={job.id || index}>
                      <td>{job.title}</td>
                      <td>{job.department}</td>
                      <td>{job.location}</td>
                      <td>{job.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CCard>
        </CCol>
      </CRow>

      {/* Payroll Section */}
      <CRow>
        <CCol xs={12}>
          <CCard>
            <h5 className="p-3">Payroll</h5>
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData?.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{user.name}</td> {/* Display the user's name */}
                      <td>{user.payroll?.salary || 'N/A'}</td> {/* Access salary from payroll */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Hrdash;
