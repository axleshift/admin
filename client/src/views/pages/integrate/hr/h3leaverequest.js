import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../../utils/axiosInstance";
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CBadge,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
  CPagination,
  CPaginationItem
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import {
  cilCalendar,
  cilMedicalCross,
  cilPeople,
  cilBriefcase,
  cilUser,
  cilInfo,
  cilPencil,
  cilMoney
} from '@coreui/icons';

const H3LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const [toast, setToast] = useState(null);
  const itemsPerPage = 5;
  
  // Reference for the toaster
  const toaster = useRef();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      // Updated to match the new endpoint
      const response = await axiosInstance.get("/hr/leaveRequest");
      
      // Extract the data using the new structure from the endpoint
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      showToast('danger', 'Error', 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = leaveRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);

  const getStatusBadge = (status) => {
    if (!status) return <CBadge color="secondary">Unknown</CBadge>;
    
    switch (status.toLowerCase()) {
      case 'approved':
        return <CBadge color="success">{status}</CBadge>;
      case 'pending':
        return <CBadge color="warning">{status}</CBadge>;
      case 'rejected':
        return <CBadge color="danger">{status}</CBadge>;
      default:
        return <CBadge color="info">{status}</CBadge>;
    }
  };

  const getPaidStatusBadge = (isPaid) => {
    if (!isPaid) return <CBadge color="secondary">Unknown</CBadge>;
    
    return isPaid.toLowerCase() === 'paid' ? 
      <CBadge color="success">{isPaid}</CBadge> : 
      <CBadge color="secondary">{isPaid}</CBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Error';
    }
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setComments('');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setActionType('');
    setComments('');
  };

  const showToast = (color, title, message) => {
    setToast(
      <CToast autohide={true} delay={5000}>
        <CToastHeader closeButton color={color}>
          <strong className="me-auto">{title}</strong>
        </CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>
    );
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(true);
      
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      
      // Send the update request to the server
      await axiosInstance.put(`/hr/leaveRequest/${selectedRequest.id}`, {
        status: newStatus,
        comments: comments
      });
      
      // Update the local state
      setLeaveRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: newStatus } 
            : req
        )
      );
      
      // Close the modal and show success message
      handleModalClose();
      showToast(
        'success', 
        'Success', 
        `Leave request has been ${newStatus.toLowerCase()} successfully`
      );
    } catch (error) {
      console.error(`Error ${actionType}ing leave request:`, error);
      showToast(
        'danger', 
        'Error', 
        `Failed to ${actionType} leave request. Please try again.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return 'Error';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDocumentView = (documentPath) => {
    if(!documentPath){
      showToast('warning','info','No document available');
    }
  }

  return (
    <CContainer fluid className="mt-4">
      {/* Render toast notifications */}
      <CToaster ref={toaster} push={toast} placement="top-end" />
    
      <CCard className="shadow">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <CIcon icon={cilCalendar} className="me-2" />
            Leave Requests
          </h4>
          <CButton 
            color="light" 
            size="sm" 
            onClick={fetchLeaveRequests}
            disabled={loading}
          >
            <CIcon icon={cilPencil} className="me-1" />
            Refresh
          </CButton>
        </CCardHeader>
    
        <CCardBody>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p className="mt-2 text-muted">Loading leave requests...</p>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center p-4">
              <CIcon icon={cilInfo} size="xl" className="mb-3 text-muted" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <>
              {/* Responsive Summary Cards */}
              <CRow className="mb-3">
                <CCol xs={12} sm={6} md={4} lg={3} className="mb-2">
                  <CCard className="text-white bg-info">
                    <CCardBody className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-0">Total Requests</h5>
                        <h3 className="mb-0">{leaveRequests.length}</h3>
                      </div>
                      <CIcon icon={cilPeople} size="3xl" />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol xs={12} sm={6} md={4} lg={3} className="mb-2">
                  <CCard className="text-white bg-warning">
                    <CCardBody className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-0">Pending</h5>
                        <h3 className="mb-0">
                          {leaveRequests.filter(r => r.status && r.status.toLowerCase() === 'pending').length}
                        </h3>
                      </div>
                      <CIcon icon={cilMedicalCross} size="3xl" />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol xs={12} sm={6} md={4} lg={3} className="mb-2">
                  <CCard className="text-white bg-success">
                    <CCardBody className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-0">Approved</h5>
                        <h3 className="mb-0">
                          {leaveRequests.filter(r => r.status && r.status.toLowerCase() === 'approved').length}
                        </h3>
                      </div>
                      <CIcon icon={cilBriefcase} size="3xl" />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
    
              {/* Responsive Table */}
              <div className="table-responsive">
                <CTable striped hover responsive className="border">
                  <CTableHead className="bg-light">
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>
                        <CIcon icon={cilUser} className="me-1" /> 
                        Employee
                      </CTableHeaderCell>
                      <CTableHeaderCell>Department</CTableHeaderCell>
                      <CTableHeaderCell>Leave Type</CTableHeaderCell>
                      <CTableHeaderCell>Start Date</CTableHeaderCell>
                      <CTableHeaderCell>Days</CTableHeaderCell>
                      <CTableHeaderCell>
                        <CIcon icon={cilMoney} className="me-1" />
                        Amount
                      </CTableHeaderCell>
                      <CTableHeaderCell>Paid Status</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Document</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentItems.map((request) => (
                      <CTableRow key={request.id}>
                        <CTableDataCell>{request.id}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle p-2 me-2 text-primary">
                              <CIcon icon={cilUser} />
                            </div>
                            <div>
                              <div className="fw-bold">{request.name || 'Unknown'}</div>
                              <small className="text-muted">{request.reason || 'No reason'}</small>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>{request.department || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{request.leave_type || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{formatDate(request.start_date)}</CTableDataCell>
                        <CTableDataCell>{request.days || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(request.amount)}</CTableDataCell>
                        <CTableDataCell>{getPaidStatusBadge(request.isPaid)}</CTableDataCell>
                        <CTableDataCell>{getStatusBadge(request.status)}</CTableDataCell>
                        <CTableDataCell>
                           {request.document_path ? (
                                                      <CButton
                                                        color="info"
                                                        size="sm"
                                                        onClick={() => handleDocumentView(request.document_path)}
                                                      >
                                                        <CIcon icon={cilFile} />
                                                      </CButton>
                                                    ) : (
                                                      <span className="text-muted">No doc</span>
                                                    )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {request.status && request.status.toLowerCase() === 'pending' && (
                            <>
                              <CButton
                                color="success"
                                size="sm"
                                onClick={() => handleActionClick(request, 'approve')}
                                disabled={actionLoading}
                              >
                                Approve
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleActionClick(request, 'reject')}
                                disabled={actionLoading}
                              >
                                Reject
                              </CButton>
                            </>
                          )}
                          {(!request.status || request.status.toLowerCase() !== 'pending') && (
                            <span className="text-muted">No actions available</span>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <CPagination className="mt-3 justify-content-center" aria-label="Page navigation">
                  <CPaginationItem 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <CPaginationItem 
                      key={index + 1}
                      active={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </CPaginationItem>
                  ))}
                  
                  <CPaginationItem 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
      
      {/* Action Modal */}
      <CModal visible={showModal} onClose={handleModalClose}>
        <CModalHeader onClose={handleModalClose}>
          <CModalTitle>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div className="mb-3">
              <p>
                <strong>Employee:</strong> {selectedRequest.name || 'Unknown'}<br />
                <strong>Leave Type:</strong> {selectedRequest.leave_type || 'N/A'}<br />
                <strong>Start Date:</strong> {formatDate(selectedRequest.start_date)}<br />
                <strong>Duration:</strong> {selectedRequest.days || 'N/A'} days
              </p>
              
              <label htmlFor="comments" className="form-label">Comments:</label>
              <CFormTextarea
                id="comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments here (optional)"
              />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleModalClose}>
            Cancel
          </CButton>
          <CButton 
            color={actionType === 'approve' ? 'success' : 'danger'} 
            onClick={handleActionSubmit}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              actionType === 'approve' ? 'Approve' : 'Reject'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default H3LeaveRequest;