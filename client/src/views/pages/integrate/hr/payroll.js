import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CSpinner,
  CAlert,
  CButton,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CPagination,
  CPaginationItem,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFileInvoice, 
  faDownload, 
  faSort, 
  faSortUp, 
  faSortDown, 
  faEye,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import CIcon from '@coreui/icons-react';
import logActivity from '../../../../utils/activityLogger';

const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [toaster, setToaster] = useState(null);
  const itemsPerPage = 10;
  
  // Get user information from localStorage
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username'); 
  const userId = localStorage.getItem('userId');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const userName = localStorage.getItem('name');
  
  useEffect(() => {
    fetchPayrollData();
    
    // Log page view when component mounts
    logPageView();
  }, []);

  // Function to log the page view activity
  const logPageView = async () => {
    try {
      if (userId && userName && userRole && userDepartment) {
        // Log activity
        await logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: 'payroll',
          action: 'Page View',
          description: 'User viewed the Payroll page'
        });
      }
    } catch (error) {
      console.warn("Error logging page view:", error);
    }
  };

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hr/payroll');
      
      if (response.data && Array.isArray(response.data)) {
        setPayrollData(response.data);
        
        // Show success toast notification
        setToast(
          <CToast autohide={true} delay={5000}>
            <CToastHeader closeButton>
              <strong className="me-auto">Success</strong>
            </CToastHeader>
            <CToastBody>
              Successfully loaded {response.data.length} payroll records!
            </CToastBody>
          </CToast>
        );
      } else {
        console.warn("Unexpected API response format:", response.data);
        setPayrollData([]);
        
        // Show warning toast notification
        setToast(
          <CToast autohide={true} delay={5000} color="warning">
            <CToastHeader closeButton>
              <strong className="me-auto">Warning</strong>
            </CToastHeader>
            <CToastBody>
              Received unexpected data format. Please contact support if this persists.
            </CToastBody>
          </CToast>
        );
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch payroll data. Please try again later.');
      console.error('Error fetching payroll data:', err);
      setPayrollData([]);
      
      // Show error toast notification
      setToast(
        <CToast autohide={true} delay={5000} color="danger">
          <CToastHeader closeButton>
            <strong className="me-auto">Error</strong>
          </CToastHeader>
          <CToastBody>
            Failed to fetch payroll data. Please try again later.
          </CToastBody>
        </CToast>
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    await fetchPayrollData();
    
    // Log refresh action
    try {
      if (userId && userName && userRole && userDepartment) {
        await logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: '/hr/payroll',
          action: 'Refresh Data',
          description: 'User refreshed the Payroll data'
        });
      }
    } catch (error) {
      console.warn("Error logging refresh action:", error);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ms-1 text-gray-400" />;
    return sortConfig.direction === 'ascending' ? 
      <FontAwesomeIcon icon={faSortUp} className="ms-1" /> : 
      <FontAwesomeIcon icon={faSortDown} className="ms-1" />;
  };

  // Sort the data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return payrollData;
    
    return [...payrollData].sort((a, b) => {
      // Handle different data types appropriately
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      // Handle numeric values (with string representations)
      if (!isNaN(parseFloat(valueA)) && !isNaN(parseFloat(valueB))) {
        return sortConfig.direction === 'ascending' 
          ? parseFloat(valueA) - parseFloat(valueB) 
          : parseFloat(valueB) - parseFloat(valueA);
      }
      
      // Handle strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'ascending'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Fallback for other types
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [payrollData, sortConfig]);

  // Filter the data
  const filteredData = sortedData.filter(item => {
    return Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Get month name from number
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `Month ${monthNumber}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="mb-4">
      {/* Toaster component to show notifications */}
      <CToaster ref={setToaster} push={toast} placement="top-end" />
      
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Payroll Management</h4>
              <div>
                <CButton color="light" className="me-2" onClick={handleRefresh}>
                  <FontAwesomeIcon icon={faSync} className="me-1" /> Refresh
                </CButton>
              </div>
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
                  {!loading && !error && (
                    <small className="text-medium-emphasis">
                      Showing {filteredData.length} of {payrollData.length} records
                    </small>
                  )}
                </CCol>
              </CRow>
              
              {/* Loading state */}
              {loading && (
                <div className="text-center p-5">
                  <CSpinner color="primary" />
                  <div className="mt-3">Loading payroll data...</div>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <CAlert color="danger">
                  {error}
                  <CButton color="link" className="p-0 ms-2" onClick={handleRefresh}>
                    Try again
                  </CButton>
                </CAlert>
              )}
              
              {/* Data table */}
              {!loading && !error && (
                <>
                  <div className="table-responsive">
                    <CTable hover bordered>
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell 
                            onClick={() => requestSort('id')}
                            style={{ cursor: 'pointer' }}
                          >
                            ID {getSortIcon('id')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('employee_id')}
                            style={{ cursor: 'pointer' }}
                          >
                            Employee ID {getSortIcon('employee_id')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('name')}
                            style={{ cursor: 'pointer' }}
                          >
                            Employee {getSortIcon('name')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('department')}
                            style={{ cursor: 'pointer' }}
                          >
                            Department {getSortIcon('department')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('job_position')}
                            style={{ cursor: 'pointer' }}
                          >
                            Position {getSortIcon('job_position')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('gross_salary')}
                            style={{ cursor: 'pointer' }}
                            className="text-end"
                          >
                            Gross Pay {getSortIcon('gross_salary')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('net_salary')}
                            style={{ cursor: 'pointer' }}
                            className="text-end"
                          >
                            Net Pay {getSortIcon('net_salary')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('year')}
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                          >
                            Period {getSortIcon('year')}
                          </CTableHeaderCell>
                          <CTableHeaderCell 
                            onClick={() => requestSort('status')}
                            style={{ cursor: 'pointer' }}
                            className="text-center"
                          >
                            Status {getSortIcon('status')}
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {currentItems.length > 0 ? (
                          currentItems.map((item, index) => (
                            <CTableRow key={item.id || index}>
                              <CTableDataCell>{item.id || '—'}</CTableDataCell>
                              <CTableDataCell>{item.employee_id || '—'}</CTableDataCell>
                              <CTableDataCell>{item.name || '—'}</CTableDataCell>
                              <CTableDataCell>{item.department || '—'}</CTableDataCell>
                              <CTableDataCell>{item.job_position || '—'}</CTableDataCell>
                              <CTableDataCell className="text-end">{formatCurrency(item.gross_salary)}</CTableDataCell>
                              <CTableDataCell className="text-end">{formatCurrency(item.net_salary)}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {`${getMonthName(item.month)}, ${item.year}`}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CBadge color={getStatusColor(item.status)}>
                                  {item.status || 'Pending'}
                                </CBadge>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan="10" className="text-center p-4 text-medium-emphasis">
                              No payroll records found.
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <CPagination className="mt-3 justify-content-center" aria-label="Page navigation">
                      <CPaginationItem 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <CPaginationItem 
                          key={page} 
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </CPaginationItem>
                      ))}
                      
                      <CPaginationItem 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default PayrollPage;