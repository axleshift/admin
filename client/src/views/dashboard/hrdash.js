import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFileInvoice, faSearch } from "@fortawesome/free-solid-svg-icons";
import StatBox from "../pages/scene/statbox";
import CustomHeader from "../../components/header/customhead";
import { 
  CContainer, 
  CRow, 
  CCol, 
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
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CSpinner
} from "@coreui/react";
import { useGethrdashQuery, useGetJobPostingsQuery } from "../../state/hrApi";
import AnnouncementList from '../pages/Announcement/AnnouncementList';
import axiosInstance from '../../utils/axiosInstance';

const Hrdash = () => {
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGethrdashQuery();
  const { data: jobPostingsResponse, error: jobPostingsError, isLoading: jobPostingsLoading } = useGetJobPostingsQuery();
  
  const [leaveRequestCount, setLeaveRequestCount] = useState(0);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract the jobPostings array properly from the response
  const jobPostings = jobPostingsResponse?.data || [];

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/hr/leaveRequest')
      .then(response => setLeaveRequestCount(response.data.count || 0))
      .catch(err => setError(err))
      .finally(() => setLoading(false));

    axiosInstance.get('/hr/payroll')
      .then(response => {
        // Check if response.data has payrollEntries property
        const payrollData = response.data.payrollEntries || response.data || [];
        setPayroll(payrollData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Filter payroll data based on search term
  const filteredPayroll = payroll.filter(item => {
    return Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          <StatBox 
            title="Total Employees" 
            value={dashboardData?.totalWorkers} 
            description="Since last month" 
            icon={<FontAwesomeIcon icon={faEnvelope} />}
            increase={0} // Adding the required increase prop
          />
        </CCol>
        <CCol xs={12} lg={6} className="mb-3">
          <StatBox 
            title="Leave Requests" 
            value={leaveRequestCount} 
            description="Total pending requests" 
            icon={<FontAwesomeIcon icon={faEnvelope} />}
            increase={0} // Adding the required increase prop
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow">
            <CCardHeader className="bg-primary text-white">
              <h5 className="m-0">Job Postings</h5>
            </CCardHeader>
            <CCardBody>
              {jobPostings.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Capacity</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPostings.map((job, index) => (
                      <tr key={job._id || index}>
                        <td className="fw-bold">{job.title}</td>
                        <td>{job.category}</td>
                        <td>{job.author}</td>
                        <td>{job.capacity}</td>
                        <td>
                          {job.responsibilities ? 
                            (job.responsibilities.length > 100 ? 
                              `${job.responsibilities.substring(0, 100)}...` : 
                              job.responsibilities) : 
                            "No description available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-3">No job postings available</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow">
            <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="m-0">Payroll</h5>
              <CButton color="light" size="sm">
                <FontAwesomeIcon icon={faFileInvoice} className="me-1" /> 
                Generate Report
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Search and controls */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search payroll..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={6} className="d-flex justify-content-end align-items-center">
                  <small className="text-medium-emphasis">
                    Showing {filteredPayroll.length} of {payroll.length} records
                  </small>
                </CCol>
              </CRow>

              {filteredPayroll.length > 0 ? (
                <div className="table-responsive">
                  <CTable striped hover bordered>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Employee ID</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Gross Pay</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Net Pay</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredPayroll.map((item, index) => (
                        <CTableRow key={item.id || index}>
                          <CTableDataCell>{item.employee_id || '—'}</CTableDataCell>
                          <CTableDataCell>{item.name || '—'}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatCurrency(item.gross_salary)}</CTableDataCell>
                          <CTableDataCell className="text-end">{formatCurrency(item.net_salary)}</CTableDataCell>
                         
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              ) : (
                <p className="text-center p-3">No payroll data available</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Hrdash;