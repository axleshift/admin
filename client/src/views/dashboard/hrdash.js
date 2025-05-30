import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFileInvoice, faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
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
import axiosInstance from '../../utils/axiosInstance';
import logActivity from '../../utils/activityLogger'
const Hrdash = () => {
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGethrdashQuery();
  const { data: jobPostingsResponse, error: jobPostingsError, isLoading: jobPostingsLoading } = useGetJobPostingsQuery();
  
  const [leaveRequestCount, setLeaveRequestCount] = useState(0);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
 const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username');
  logActivity({
    name: userName,
    role: userRole,
    department: userDepartment,
    route: 'Hr Dashboard',
    action: 'Navigate',
    description: `${userName} Navigate to Hr Dashboard`
  }).catch(console.warn);
  
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

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setUserLoading(true);
        const response = await axiosInstance.get('/hr/worker');
        const userData = response.data || [];
        setUsers(userData);
        setUserLoading(false);
      } catch (err) {
        setUserError(err.message || 'Failed to fetch user data');
        setUserLoading(false);
        console.error('Error fetching users:', err);
      }
    };
    
    fetchAllUsers();
  }, []);

  // Auto-detect and format currency
  const autoDetectAndFormatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    // Convert to string if it's a number
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    
    // Remove whitespace and common separators to help with detection
    const sanitized = amountStr.replace(/[\s,]/g, '');
    
    // Currency symbol detection patterns
    const currencyPatterns = {
      '$': 'USD',
      '₱': 'PHP',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₩': 'KRW',
      '₹': 'INR',
      'R$': 'BRL',
      'A$': 'AUD',
      'C$': 'CAD',
      '฿': 'THB',
      '₽': 'RUB',
      'kr': 'SEK', // Used for multiple Nordic currencies
      'CHF': 'CHF',
      'zł': 'PLN'
    };
    
    // Check for currency codes at start or end
    const currencyCodes = ['USD', 'PHP', 'EUR', 'GBP', 'JPY', 'KRW', 'INR', 'BRL', 'AUD', 'CAD', 'THB', 'RUB', 'SEK', 'CHF', 'PLN'];
    let detectedCurrency = 'USD'; // Default currency
    
    // First, check for symbols
    for (const [symbol, currency] of Object.entries(currencyPatterns)) {
      if (sanitized.includes(symbol)) {
        detectedCurrency = currency;
        break;
      }
    }
    
    // Then check for currency codes
    for (const code of currencyCodes) {
      if (sanitized.includes(code)) {
        detectedCurrency = code;
        break;
      }
    }
    
    // Extract the numeric value
    let numericValue = sanitized.replace(/[^\d.-]/g, '');
    
    // Parse to float
    const value = parseFloat(numericValue);
    
    // If we couldn't parse a valid number, return the original input
    if (isNaN(value)) return amount;
    
    // Format with the detected currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: detectedCurrency
    }).format(value);
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

  const totalEmployees = userData.length;
  
  // Filter payroll data based on search term
  const filteredPayroll = payroll.filter(item => {
    return Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (dashboardLoading || jobPostingsLoading || loading || userLoading) return <p>Loading...</p>;
  if (dashboardError || jobPostingsError || error || userError) return <p>Error fetching data</p>;

  return (
    <CContainer fluid className="p-3">
      <CRow>
        <CCol xs={12}>
          <CustomHeader title="HR Dashboard" subtitle="Welcome to the HR Dashboard" />
        </CCol>
      </CRow>

      <CRow className="my-3">
        <CCol xs={12} md={6} lg={3}>
          <StatBox 
            title="Total Employees"
            value={totalEmployees}
            icon={<FontAwesomeIcon icon={faUser} />}
            color="primary"
            description="Total registered employees"
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
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
                          <CTableDataCell className="text-end">{autoDetectAndFormatCurrency(item.gross_salary)}</CTableDataCell>
                          <CTableDataCell className="text-end">{autoDetectAndFormatCurrency(item.net_salary)}</CTableDataCell>
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