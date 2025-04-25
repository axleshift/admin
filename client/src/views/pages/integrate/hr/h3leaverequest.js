import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../../utils/axiosInstance";
import logActivity from '../../../../utils/activityLogger';
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
  CPaginationItem,
  CAlert,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormInput,
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
  cilMoney,
  cilFile,
  cilX,
  cilLockLocked,
  cilCopy,
} from '@coreui/icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faDroplet
} from "@fortawesome/free-solid-svg-icons";
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const itemsPerPage = 5;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // User information (should be retrieved from your auth context/state)
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name');
  const userUsername = localStorage.getItem('username');
  // Reference for the toaster
  const toaster = useRef();

   logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: 'Leave Request',
        action: 'Page Visit',
        description: `${userName} visit the Leave Request page`
      }).catch(console.warn);
  

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Show toast function
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

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      // Updated to match the new endpoint
      const response = await axiosInstance.get("/hr/leaveRequest");
      
      // Extract the data using the new structure from the endpoint
      const fetchedData = response.data.data || [];
      setLeaveRequests(fetchedData);
      
      // Show success toast with count information
      showToast(
        'success', 
        'Data Fetched Successfully', 
        `Retrieved ${fetchedData.length} leave request(s)`,
      );
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      
      // Show error toast
      showToast(
        'danger', 
        'Fetch Error', 
        `Failed to load leave requests: ${error.response?.data?.error || error.message}`
      );
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

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordCopied(false);
  };

  const handleDocumentModalClose = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
    setDocumentError(null);
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(downloadPassword).then(() => {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 3000);
    }).catch(err => {
      console.error('Failed to copy password:', err);
      showToast('danger', 'Error', 'Failed to copy password to clipboard');
    });
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



  const getFileType = (filePath) => {
    if (!filePath) return 'unknown';
    
    const extension = filePath.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'unknown';
    }
  };

  const renderDocumentViewer = () => {
    if (documentLoading) {
      return (
        <div className="text-center p-5">
          <CSpinner color="primary" />
          <p className="mt-3">Loading document...</p>
        </div>
      );
    }

    if (documentError) {
      return (
        <CAlert color="danger" className="mb-0">
          <h4>Error Loading Document</h4>
          <p>{documentError}</p>
          <p>Please try again or contact support if the issue persists.</p>
        </CAlert>
      );
    }

    if (!selectedDocument) {
      return (
        <CAlert color="warning" className="mb-0">
          <h4>No Document Selected</h4>
          <p>There was an error selecting the document. Please try again.</p>
        </CAlert>
      );
    }

    // In a real implementation, you would use the actual document URL from your backend
    const documentUrl = selectedDocument.path;
    
    // Based on file type, render appropriate viewer
    switch (selectedDocument.type) {
      case 'pdf':
        return (
          <div className="document-viewer-container" style={{ height: '600px', width: '100%' }}>
            <iframe
              src={documentUrl}
              title={selectedDocument.name}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            >
              Your browser does not support iframes.
            </iframe>
          </div>
        );
      case 'image':
        return (
          <div className="text-center p-3">
            <img 
              src={documentUrl} 
              alt={selectedDocument.name} 
              className="img-fluid" 
              style={{ maxHeight: '600px', maxWidth: '100%' }} 
            />
          </div>
        );
      case 'word':
        return (
          <div className="text-center p-4">
            <div className="document-preview-card p-4 border rounded bg-light">
              <CIcon icon={cilFile} size="3xl" className="text-primary mb-3" />
              <h5>Microsoft Word Document</h5>
              <p className="text-muted mb-3">Preview not available for Word documents</p>
              <div className="document-info p-3 bg-white rounded border mb-3">
                <p className="mb-1"><strong>File Name:</strong> {selectedDocument.name}</p>
                <p className="mb-1"><strong>Employee:</strong> {selectedDocument.employeeName}</p>
                <p className="mb-0"><strong>Type:</strong> Microsoft Word Document</p>
              </div>
            </div>
          </div>
        );
      case 'excel':
        return (
          <div className="text-center p-4">
            <div className="document-preview-card p-4 border rounded bg-light">
              <CIcon icon={cilFile} size="3xl" className="text-success mb-3" />
              <h5>Microsoft Excel Document</h5>
              <p className="text-muted mb-3">Preview not available for Excel documents</p>
              <div className="document-info p-3 bg-white rounded border mb-3">
                <p className="mb-1"><strong>File Name:</strong> {selectedDocument.name}</p>
                <p className="mb-1"><strong>Employee:</strong> {selectedDocument.employeeName}</p>
                <p className="mb-0"><strong>Type:</strong> Microsoft Excel Document</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center p-4">
            <div className="document-preview-card p-4 border rounded bg-light">
              <CIcon icon={cilFile} size="3xl" className="text-secondary mb-3" />
              <h5>Document Preview</h5>
              <p className="text-muted mb-3">Preview not available for this file type</p>
              <div className="document-info p-3 bg-white rounded border mb-3">
                <p className="mb-1"><strong>File Name:</strong> {selectedDocument.name}</p>
                <p className="mb-1"><strong>Employee:</strong> {selectedDocument.employeeName}</p>
                <p className="mb-0"><strong>Type:</strong> {selectedDocument.type.toUpperCase()}</p>
              </div>
            </div>
          </div>
        );
    }
  };
  const handleDownloadSecurePdf = async (downloadType) => {
    try {
      setActionLoading(true);
      
      // Get the download type and set file name
      let fileName = '';
      
      switch(downloadType) {
        case 'all': 
          fileName = 'All_LeaveRequests'; 
          break;
        case 'pending': 
          fileName = 'Pending_LeaveRequests'; 
          break;
        case 'approved': 
          fileName = 'Approved_LeaveRequests';
          break;
        case 'rejected': 
          fileName = 'Rejected_LeaveRequests';
          break;
        default:
          fileName = 'LeaveRequests';
      }
      
      // Send request to server
      const response = await axiosInstance.post(
        '/management/downloadLeaveRequest',
        {
          name: userName,
          role: userRole,
          username: userUsername,
          downloadType: downloadType
        },
        { responseType: 'blob' }
      );
      
      // Generate password and show in modal
      const password = userName.substring(0, 2) + userRole.charAt(0) + userUsername.slice(-6);
      setDownloadPassword(password);
      setDownloadFileName(`${fileName}_Protected.zip`);
      setShowPasswordModal(true);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${fileName}_Protected.zip`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      showToast(
        'success', 
        'Success', 
        `File ${fileName}_Protected.zip downloaded successfully!`
      );
      
      // Fixed logActivity - making it await and improving description
      await logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/leave-requests',
        action: 'Download',
        description: `${userName} downloaded ${downloadType} leave requests as ${fileName}_Protected.zip`
      }).catch(error => {
        console.warn("Error logging download activity:", error);
      });
  
    } catch (err) {
      console.error('Error creating protected zip:', err);
      
      // Show error toast
      showToast(
        'danger', 
        'Error', 
        'Failed to create protected download. Please try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };
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
          {/* Add this dropdown near your action buttons */}
            <CDropdown>
              <CDropdownToggle color="primary" disabled={actionLoading}>
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Secure PDF Download
                {actionLoading && <CSpinner size="sm" className="ms-2" />}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => handleDownloadSecurePdf('all')}>All Leave Requests</CDropdownItem>
                <CDropdownItem onClick={() => handleDownloadSecurePdf('pending')}>Pending Requests</CDropdownItem>
                <CDropdownItem onClick={() => handleDownloadSecurePdf('approved')}>Approved Requests</CDropdownItem>
                <CDropdownItem onClick={() => handleDownloadSecurePdf('rejected')}>Rejected Requests</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
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

      {/* Document Viewer Modal */}
      <CModal 
        visible={showDocumentModal} 
        onClose={handleDocumentModalClose}
        size="lg"
        backdrop="static"
      >
        <CModalHeader onClose={handleDocumentModalClose}>
          <CModalTitle>
            {selectedDocument && (
              <>
                <CIcon icon={cilFile} className="me-2" />
                Document Preview: {selectedDocument.employeeName}
              </>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-0">
          <div className="document-viewer">
            {renderDocumentViewer()}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleDocumentModalClose}>
            <CIcon icon={cilX} className="me-1" />
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Password Modal */}
      <CModal 
        visible={showPasswordModal} 
        onClose={handlePasswordModalClose}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader className="bg-info text-white">
          <CModalTitle>
            <CIcon icon={cilLockLocked} className="me-2" />
            Secure File Password
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <div className="text-center mb-3">
            <div className="display-6 mb-3 text-info">
              <CIcon icon={cilLockLocked} size="xl" />
            </div>
            <h5>Your download has started</h5>
            <p className="text-muted">
              Use the password below to extract the ZIP file contents:
            </p>
          </div>
          
          <div className="password-container p-3 bg-light rounded border position-relative mb-4">
            <div className="d-flex align-items-center">
              <CFormInput
                type="text"
                value={downloadPassword}
                readOnly
                className="bg-white border-info text-center fw-bold"
              />
              <CButton 
                color="secondary"
                className="ms-2"
                onClick={copyPasswordToClipboard}
                title="Copy to clipboard"
                >
                  <CIcon icon={cilCopy} />
                </CButton>
              </div>
              {passwordCopied && (
                <div className="text-success mt-2 small">
                  <i className="fas fa-check-circle"></i> Password copied to clipboard!
                </div>
              )}
            </div>
            
            <div className="file-info mb-4 p-3 bg-light rounded border">
              <p className="mb-1"><strong>File Name:</strong> {downloadFileName}</p>
              <p className="mb-1"><strong>Format:</strong> Protected ZIP Archive</p>
              <p className="mb-0"><strong>Contents:</strong> HR Leave Request Reports (PDF)</p>
            </div>
            
            <div className="alert alert-warning">
            <strong>Important:</strong> Keep this password secure. You&apos;ll need it to access the contents of the downloaded file.
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="info" 
              className="px-4"
              onClick={handlePasswordModalClose}
            >
             I&apos;ve Saved My Password
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    );
  };
  
  export default H3LeaveRequest;