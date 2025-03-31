import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import StatBox from "../pages/scene/statbox";
import CustomHeader from "../../components/header/customhead";
import { CContainer, CRow, CCol, CCard } from "@coreui/react";
import { useGethrdashQuery, useGetJobPostingsQuery } from "../../state/hrApi";
import AnnouncementList from '../pages/Announcement/AnnouncementList';
import axiosInstance from '../../utils/axiosInstance';

const Hrdash = () => {
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGethrdashQuery();
  const { data: jobPostings, error: jobPostingsError, isLoading: jobPostingsLoading } = useGetJobPostingsQuery();
  
  const [leaveRequestCount, setLeaveRequestCount] = useState(0);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/hr/leaveRequest')
      .then(response => setLeaveRequestCount(response.data.count || 0))
      .catch(err => setError(err))
      .finally(() => setLoading(false));

    axiosInstance.get('/hr/payroll')
      .then(response => setPayroll(response.data || []))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (dashboardLoading || jobPostingsLoading || loading) return <p>Loading...</p>;
  if (dashboardError || jobPostingsError || error) return <p>Error fetching data</p>;

  return (
    <CContainer fluid className="p-3">
      <CRow>
        <CCol xs={12}>
          <CustomHeader title="HR Dashboard" subtitle="Welcome to the HR Dashboard" />
          <AnnouncementList />
        </CCol>
      </CRow>

      <CRow className="my-3">
        <CCol xs={12} lg={6} className="mb-3">
          <StatBox title="Total Employees" value={dashboardData?.totalWorkers} description="Since last month" icon={<FontAwesomeIcon icon={faEnvelope} />} />
        </CCol>
        <CCol xs={12} lg={6} className="mb-3">
          <StatBox title="Leave Requests" value={leaveRequestCount} description="Total pending requests" icon={<FontAwesomeIcon icon={faEnvelope} />} />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} lg={6}>
          <CCard>
            <h5 className="p-3">Job Postings</h5>
            <table className="table table-striped">
              <thead>
                <tr><th>Job Title</th><th>Department</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {jobPostings?.map((job, index) => (
                  <tr key={index}><td>{job.title}</td><td>{job.department}</td><td>{job.location}</td><td>{job.status}</td></tr>
                ))}
              </tbody>
            </table>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard>
            <h5 className="p-3">Payroll</h5>
            <table className="table table-striped">
              <thead>
                <tr><th>Name</th><th>Salary</th></tr>
              </thead>
              <tbody>
                {payroll?.map((user, index) => (
                  <tr key={index}><td>{user.name}</td><td>{user.salary || "N/A"}</td></tr>
                ))}
              </tbody>
            </table>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Hrdash;
