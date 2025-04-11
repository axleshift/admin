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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea
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
  faSync,
  faCheckCircle,
  faTimesCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import CIcon from '@coreui/icons-react';

const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for approval/rejection modal
  const [statusModal, setStatusModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [statusAction, setStatusAction] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/hr/payroll');
      
      if (response.data && Array.isArray(response.data)) {
        setPayrollData(response.data);
      } else {
        console.warn("Unexpected API response format:", response.data);
        setPayrollData([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch payroll data. Please try again later.');
      console.error('Error fetching payroll data:', err);
      setPayrollData([]);
    } finally {
      setLoading(false);
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

  // Handle opening the status modal
  const openStatusModal = (payroll, action) => {
    setSelectedPayroll(payroll);
    setStatusAction(action);
    setStatusRemarks('');
    setStatusError(null);
    setStatusModal(true);
  };

  // Handle approving or rejecting a payroll
  const handleStatusUpdate = async () => {
    if (!selectedPayroll || !statusAction) return;
    
    setProcessingStatus(true);
    setStatusError(null);
    
    try {
      const response = await axiosInstance.put(`/hr/payroll/${selectedPayroll.id}/status`, {
        status: statusAction,
        remarks: statusRemarks
      });
      
      // Update the payroll data in the state
      setPayrollData(prevData => 
        prevData.map(item => 
          item.id === selectedPayroll.id 
            ? { ...item, status: statusAction.charAt(0).toUpperCase() + statusAction.slice(1), payroll_status: statusAction } 
            : item
        )
      );
      
      // Close the modal and reset
      setStatusModal(false);
      setSelectedPayroll(null);
      setStatusAction('');
      setStatusRemarks('');
      
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error(`Failed to ${statusAction} payroll:`, err);
      setStatusError(`Failed to ${statusAction} payroll. ${err.response?.data?.error || 'Please try again later.'}`);
    } finally {
      setProcessingStatus(false);
    }
  };

  return (
    <div className="mb-4">
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Payroll Management</h4>
              <div>
                <CButton color="light" className="me-2" onClick={fetchPayrollData}>
                  <FontAwesomeIcon icon={faSync} className="me-1" /> Refresh
                </CButton>
                <CButton color="primary">
                  <FontAwesomeIcon icon={faFileInvoice} className="me-1" /> 
                  Generate Report
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
                  <CButton color="link" className="p-0 ms-2" onClick={fetchPayrollData}>
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
                          <CTableHeaderCell className="text-center">
                            Actions
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
                              <CTableDataCell className="text-center">
                                {item.status?.toLowerCase() === 'pending' && (
                                  <>
                                    <CButton 
                                      color="success" 
                                      size="sm" 
                                      className="me-1"
                                      onClick={() => openStatusModal(item, 'approved')}
                                    >
                                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                      Approve
                                    </CButton>
                                    <CButton 
                                      color="danger" 
                                      size="sm"
                                      onClick={() => openStatusModal(item, 'rejected')}
                                    >
                                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                      Reject
                                    </CButton>
                                  </>
                                )}
                                {item.status?.toLowerCase() !== 'pending' && (
                                  <CButton 
                                    color="secondary" 
                                    size="sm"
                                    disabled
                                  >
                                    <FontAwesomeIcon icon={faEye} className="me-1" />
                                    View Details
                                  </CButton>
                                )}
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
      
      {/* Approval/Rejection Modal */}
      <CModal visible={statusModal} onClose={() => setStatusModal(false)}>
        <CModalHeader onClose={() => setStatusModal(false)}>
          <CModalTitle>
            {statusAction === 'approved' ? 'Approve Payroll' : 'Reject Payroll'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedPayroll && (
            <>
              <p>
                <strong>Employee:</strong> {selectedPayroll.name}<br />
                <strong>Amount:</strong> {formatCurrency(selectedPayroll.net_salary)}<br />
                <strong>Period:</strong> {getMonthName(selectedPayroll.month)}, {selectedPayroll.year}
              </p>
              <p>
                Are you sure you want to {statusAction === 'approved' ? 'approve' : 'reject'} this payroll?
              </p>
              <CFormTextarea
                id="statusRemarks"
                label="Remarks (Optional)"
                placeholder="Enter any remarks about this decision..."
                rows={3}
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
              />
              
              {statusError && (
                <CAlert color="danger" className="mt-3">
                  {statusError}
                </CAlert>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setStatusModal(false)}>
            Cancel
          </CButton>
          <CButton 
            color={statusAction === 'approved' ? 'success' : 'danger'} 
            onClick={handleStatusUpdate}
            disabled={processingStatus}
          >
            {processingStatus ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                Processing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={statusAction === 'approved' ? faCheckCircle : faTimesCircle} className="me-1" />
                {statusAction === 'approved' ? 'Approve' : 'Reject'}
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default PayrollPage;