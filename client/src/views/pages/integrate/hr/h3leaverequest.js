import React, { useEffect, useState } from "react";
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
  CCardFooter,
  CPagination,
  CPaginationItem,
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
  CToaster
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import {
  cilCalendar,
  cilMedicalCross,
  cilPeople,
  cilBriefcase,
  cilUser,
  cilInfo,
  cilCheck,
  cilX,
  cilPencil
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
  const toaster = React.useRef();

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/hr/leaveRequest");
      setLeaveRequests(response.data.leaveRequests || []);
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
    return isPaid.toLowerCase() === 'paid' ? 
      <CBadge color="success">{isPaid}</CBadge> : 
      <CBadge color="secondary">{isPaid}</CBadge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
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

  return (
    <CContainer className="mt-4">
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
            onClick={() => fetchLeaveRequests()}
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
              <CRow className="mb-3">
                <CCol sm={12} md={4} className="mb-2">
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
                <CCol sm={12} md={4} className="mb-2">
                  <CCard className="text-white bg-warning">
                    <CCardBody className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-0">Pending</h5>
                        <h3 className="mb-0">
                          {leaveRequests.filter(r => r.status.toLowerCase() === 'pending').length}
                        </h3>
                      </div>
                      <CIcon icon={cilMedicalCross} size="3xl" />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol sm={12} md={4} className="mb-2">
                  <CCard className="text-white bg-success">
                    <CCardBody className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-0">Approved</h5>
                        <h3 className="mb-0">
                          {leaveRequests.filter(r => r.status.toLowerCase() === 'approved').length}
                        </h3>
                      </div>
                      <CIcon icon={cilBriefcase} size="3xl" />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>

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
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Days</CTableHeaderCell>
                    <CTableHeaderCell>Paid Status</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
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
                            <div className="fw-bold">{request.name}</div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{request.department}</CTableDataCell>
                      <CTableDataCell>{request.leave_type}</CTableDataCell>
                      <CTableDataCell>
                        <small className="text-muted d-block">From</small>
                        {formatDate(request.start_date)}
                        <small className="text-muted d-block mt-1">To</small>
                        {formatDate(request.end_date)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="fw-bold">{request.total_days}</span> {request.total_days === 1 ? 'day' : 'days'}
                      </CTableDataCell>
                      <CTableDataCell>{getPaidStatusBadge(request.is_paid)}</CTableDataCell>
                      <CTableDataCell>{getStatusBadge(request.status)}</CTableDataCell>
                      <CTableDataCell>
                        {request.status.toLowerCase() === 'pending' && (
                          <div className="d-flex gap-1">
                            <CButton 
                              color="success" 
                              size="sm"
                              onClick={() => handleActionClick(request, 'approve')}
                            >
                              <CIcon icon={cilCheck} />
                            </CButton>
                            <CButton 
                              color="danger" 
                              size="sm"
                              onClick={() => handleActionClick(request, 'reject')}
                            >
                              <CIcon icon={cilX} />
                            </CButton>
                          </div>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </>
          )}
        </CCardBody>
        {!loading && leaveRequests.length > itemsPerPage && (
          <CCardFooter>
            <CPagination align="center" aria-label="Page navigation">
              <CPaginationItem 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </CPaginationItem>
              
              {[...Array(totalPages)].map((_, index) => (
                <CPaginationItem 
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </CPaginationItem>
              ))}
              
              <CPaginationItem 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </CCardFooter>
        )}
      </CCard>

      {/* Approval/Rejection Modal */}
      <CModal visible={showModal} onClose={handleModalClose}>
        <CModalHeader>
          <CModalTitle>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRequest && (
            <div className="mb-3">
              <p>
                <strong>Employee:</strong> {selectedRequest.name}
              </p>
              <p>
                <strong>Leave Type:</strong> {selectedRequest.leave_type}
              </p>
              <p>
                <strong>Duration:</strong> {formatDate(selectedRequest.start_date)} to {formatDate(selectedRequest.end_date)} ({selectedRequest.total_days} days)
              </p>
              <p>
                <strong>Reason:</strong> {selectedRequest.reason || 'Not provided'}
              </p>
              <hr />
              <div>
                <label htmlFor="comments" className="form-label">Comments:</label>
                <CFormTextarea 
                  id="comments"
                  rows={3}
                  placeholder="Add your comments here (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
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
            {actionLoading && <CSpinner size="sm" className="me-2" />}
            {actionType === 'approve' ? 'Approve' : 'Reject'} Request
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default H3LeaveRequest;