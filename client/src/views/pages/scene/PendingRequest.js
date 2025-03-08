import React from 'react';
import { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CContainer,
  CRow,
  CCol,
  CBadge,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CToast,
  CToastBody,
  CToastHeader,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CNav,
  CNavItem,
  CNavLink,
  CInputGroup,
  CFormSelect,
  CFormInput
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faClipboardList,
  faUser,
  faCalendarAlt,
  faInfoCircle,
  faFileAlt,
  faSync,
  faEye,
  faHistory,
  faFilter,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { 
  useGetRequestsQuery,
  useReceiveRequestMutation, 
  useSendRequestMutation 
} from "../../../state/adminApi";

export default function RequestListPage() {
  // RTK Query hooks for API calls
  const { 
    data: fetchedRequests = [], 
    isLoading: isFetching,
    refetch
  } = useGetRequestsQuery();
  
  const [receiveRequest, { isLoading: isReceiving }] = useReceiveRequestMutation();
  const [sendRequest, { isLoading: isSending }] = useSendRequestMutation();
  
  // State for requests data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "", color: "" });
  
  // State for the request detail modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  
  // State for the history view
  const [activeView, setActiveView] = useState("pending");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);

  // Set requests when data is fetched
  useEffect(() => {
    if (fetchedRequests && fetchedRequests.length > 0) {
      setRequests(fetchedRequests);
    }
  }, [fetchedRequests]);

  const handleAction = async (id, action) => {
    setLoading(prev => ({ ...prev, [id]: true }));
  
    try {
      const request = requests.find(req => req.id === id);
      if (!request) {
        throw new Error("Request not found");
      }
  
      if (action === "approved") {
        // Use the RTK Mutation hook directly
        await sendRequest(request).unwrap();
      } else {
        await receiveRequest({
          ...request,
          status: "rejected",
          rejectedAt: new Date().toISOString()
        }).unwrap();
      }
  
      setRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: action } : req))
      );
  
      setToast({
        visible: true,
        message: `Request ${action === "approved" ? "approved" : "rejected"} successfully`,
        color: action === "approved" ? "success" : "danger"
      });
  
      refetch();
    } catch (error) {
      console.error('Action error:', error);
      setToast({
        visible: true,
        message: `Error: ${error.message || 'Failed to process request'}`,
        color: "danger"
      });
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    }
  };
  
  // Function to view request details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsVisible(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case "approved": return { color: "success", text: "Approved" };
      case "rejected": return { color: "danger", text: "Rejected" };
      default: return { color: "warning", text: "Pending" };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter requests based on active view and history filter
  const getFilteredRequests = () => {
    let filtered = [...requests];
    
    // Filter by view type (pending or history)
    if (activeView === "pending") {
      filtered = filtered.filter(req => req.status === "pending");
    } else {
      filtered = filtered.filter(req => req.status !== "pending");
      
      // Apply history filter
      if (historyFilter === "approved") {
        filtered = filtered.filter(req => req.status === "approved");
      } else if (historyFilter === "rejected") {
        filtered = filtered.filter(req => req.status === "rejected");
      }
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(req => 
        (req.type && req.type.toLowerCase().includes(term)) ||
        (req.user && req.user.toLowerCase().includes(term)) ||
        (req.details && req.details.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  // Sort history items by date (most recent first)
  const sortRequestsByDate = (requests) => {
    return [...requests].sort((a, b) => {
      // Use the appropriate date field based on status
      const dateA = a.status === "approved" ? a.approvedAt : 
                   a.status === "rejected" ? a.rejectedAt : a.createdAt;
      const dateB = b.status === "approved" ? b.approvedAt : 
                   b.status === "rejected" ? b.rejectedAt : b.createdAt;
      
      return new Date(dateB) - new Date(dateA);
    });
  };

  const filteredRequests = getFilteredRequests();
  const sortedRequests = activeView === "history" ? sortRequestsByDate(filteredRequests) : filteredRequests;

  return (
    <CContainer fluid className="bg-light p-0 m-0 min-vh-100">
      {/* Toast notification */}
      {toast.visible && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <CToast visible={true} color={toast.color}>
            <CToastHeader closeButton>
              <FontAwesomeIcon 
                icon={toast.color === "success" ? faCheck : faTimes} 
                className="me-2" 
              />
              <strong className="me-auto">Notification</strong>
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        </div>
      )}
      
      {/* Request Details Modal */}
      <CModal 
        visible={detailsVisible} 
        onClose={() => setDetailsVisible(false)}
        size="lg"
      >
        {selectedRequest && (
          <>
            <CModalHeader>
              <CModalTitle>
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Request Details
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="border-bottom pb-3 mb-3">
                <CBadge color={getStatusBadge(selectedRequest.status).color} className="mb-2 px-3 py-2">
                  {getStatusBadge(selectedRequest.status).text}
                </CBadge>
                <h4 className="mt-2">{selectedRequest.type}</h4>
              </div>
              
              <CRow className="mb-3">
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <label className="text-muted d-block">Requested By</label>
                    <div className="fs-5">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                      {selectedRequest.user}
                    </div>
                  </div>
                </CCol>
                <CCol xs={12} md={6}>
                  <div className="mb-3">
                    <label className="text-muted d-block">Date Requested</label>
                    <div className="fs-5">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                      {selectedRequest.date || formatDate(selectedRequest.createdAt)}
                    </div>
                  </div>
                </CCol>
              </CRow>
              
              <div className="mb-4">
                <label className="text-muted d-block">Request Details</label>
                <div className="border rounded p-3 bg-light">
                  {selectedRequest.details || "No detailed description provided."}
                </div>
              </div>
              
              {selectedRequest.senderUrl && (
                <div className="mb-3">
                  <label className="text-muted d-block">Source URL</label>
                  <div>
                    <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" />
                    <a href={selectedRequest.senderUrl} target="_blank" rel="noopener noreferrer">
                      {selectedRequest.senderUrl}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Additional metadata */}
              <CRow className="bg-light rounded p-2 mt-4">
                <CCol xs={12} md={4}>
                  <small className="text-muted d-block">ID</small>
                  <code>{selectedRequest.id}</code>
                </CCol>
                <CCol xs={12} md={4}>
                  <small className="text-muted d-block">Created At</small>
                  <div>{formatDate(selectedRequest.createdAt)}</div>
                </CCol>
                <CCol xs={12} md={4}>
                  {selectedRequest.status !== "pending" && (
                    <>
                      <small className="text-muted d-block">
                        {selectedRequest.status === "approved" ? "Approved At" : "Rejected At"}
                      </small>
                      <div>
                        {formatDate(
                          selectedRequest.status === "approved" 
                            ? selectedRequest.approvedAt 
                            : selectedRequest.rejectedAt
                        )}
                      </div>
                    </>
                  )}
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              {selectedRequest.status === "pending" && (
                <>
                  <CButton
                    color="success"
                    onClick={() => {
                      handleAction(selectedRequest.id, "approved");
                      setDetailsVisible(false);
                    }}
                    disabled={loading[selectedRequest.id]}
                  >
                    {loading[selectedRequest.id] ? (
                      <CSpinner size="sm" color="light" />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="me-1" /> Approve
                      </>
                    )}
                  </CButton>
                  <CButton
                    color="danger"
                    variant="outline"
                    onClick={() => {
                      handleAction(selectedRequest.id, "rejected");
                      setDetailsVisible(false);
                    }}
                    disabled={loading[selectedRequest.id]}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" /> Reject
                  </CButton>
                </>
              )}
              <CButton color="secondary" onClick={() => setDetailsVisible(false)}>
                Close
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
      
      {/* Main content */}
      <CRow className="justify-content-center p-4 g-0">
        <CCol xs={12} lg={10} xl={9}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CCard className="shadow-lg border-0 overflow-hidden">
              <CCardHeader className="bg-primary text-white p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon 
                      icon={activeView === "pending" ? faClipboardList : faHistory} 
                      className="me-3 fs-3" 
                    />
                    <h2 className="mb-0 fw-bold">
                      {activeView === "pending" ? "Pending Requests" : "Request History"}
                    </h2>
                  </div>
                  <div className="d-flex">
                    <CButton 
                      color="light" 
                      variant="outline" 
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="me-2"
                    >
                      {isFetching ? (
                        <CSpinner size="sm" />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSync} className="me-2" />
                          Refresh
                        </>
                      )}
                    </CButton>
                    <CButton 
                      color="light" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setActiveView(activeView === "pending" ? "history" : "pending");
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={activeView === "pending" ? faHistory : faClipboardList} 
                        className="me-2" 
                      />
                      {activeView === "pending" ? "View History" : "View Pending"}
                    </CButton>
                  </div>
                </div>
                
                {/* Filter bar for history view */}
                {activeView === "history" && (
                  <div className="mt-3 pt-3 border-top border-light">
                    <CRow>
                      <CCol md={6} className="mb-2 mb-md-0">
                        <CInputGroup>
                          <CFormSelect 
                            value={historyFilter}
                            onChange={(e) => setHistoryFilter(e.target.value)}
                            aria-label="Filter status"
                            size="sm"
                          >
                            <option value="all">All Requests</option>
                            <option value="approved">Approved Only</option>
                            <option value="rejected">Rejected Only</option>
                          </CFormSelect>
                          <CButton color="light" variant="outline" size="sm">
                            <FontAwesomeIcon icon={faFilter} />
                          </CButton>
                        </CInputGroup>
                      </CCol>
                      <CCol md={6}>
                        <CInputGroup>
                          <CFormInput
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="sm"
                          />
                          <CButton color="light" variant="outline" size="sm">
                            <FontAwesomeIcon icon={faSearch} />
                          </CButton>
                        </CInputGroup>
                      </CCol>
                    </CRow>
                  </div>
                )}
              </CCardHeader>
              
              <CCardBody className="p-0">
                {isFetching && requests.length === 0 ? (
                  <div className="text-center p-5">
                    <CSpinner color="primary" />
                    <h5 className="mt-3">Loading requests...</h5>
                  </div>
                ) : (
                  <CListGroup flush>
                    {sortedRequests.length > 0 ? (
                      sortedRequests.map((request) => (
                        <CListGroupItem 
                          key={request.id} 
                          className={`border-start-0 border-end-0 p-0 ${
                            request.status !== "pending" ? "bg-light bg-opacity-50" : ""
                          }`}
                          onClick={() => viewRequestDetails(request)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="p-3">
                            <CRow className="align-items-center">
                              <CCol xs={12} md={7}>
                                <div className="d-flex align-items-center mb-2 mb-md-0">
                                  <div className={`bg-${getStatusBadge(request.status).color}-subtle p-2 rounded me-3`}>
                                    <FontAwesomeIcon 
                                      icon={request.status === "approved" ? faCheck : request.status === "rejected" ? faTimes : faFileAlt} 
                                      className={`text-${getStatusBadge(request.status).color} fs-4`} 
                                    />
                                  </div>
                                  <div>
                                    <h5 className="mb-1 d-flex align-items-center">
                                      {request.type}
                                      <FontAwesomeIcon 
                                        icon={faEye} 
                                        className="ms-2 text-primary" 
                                        style={{ fontSize: '0.8em' }}
                                      />
                                    </h5>
                                    <div className="text-muted small">
                                      <span className="me-3">
                                        <FontAwesomeIcon icon={faUser} className="me-1" />
                                        {request.user}
                                      </span>
                                      <span>
                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                        {request.date || formatDate(request.createdAt)}
                                      </span>
                                    </div>
                                    <p className="mb-0 mt-1 text-secondary">
                                      <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                      {request.details && request.details.length > 100 
                                        ? `${request.details.substring(0, 100)}...` 
                                        : request.details || "Click to view details"}
                                    </p>
                                    {request.senderUrl && (
                                      <p className="text-muted mb-0">
                                        <FontAwesomeIcon icon={faGlobe} className="me-1" />
                                        <a 
                                          href={request.senderUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {request.senderUrl}
                                        </a>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CCol>
                              
                              <CCol xs={12} md={5} className="text-md-end mt-3 mt-md-0">
                                <CBadge color={getStatusBadge(request.status).color} className="mb-2 px-3 py-2">
                                  {getStatusBadge(request.status).text}
                                </CBadge>
                                
                                {activeView === "history" && request.status !== "pending" && (
                                  <div className="mt-2 text-muted small">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    {request.status === "approved" 
                                      ? `Approved: ${formatDate(request.approvedAt)}` 
                                      : `Rejected: ${formatDate(request.rejectedAt)}`}
                                  </div>
                                )}
                                
                                {request.status === "pending" && (
                                  <div className="d-flex justify-content-md-end gap-2 mt-2">
                                    <CButton
                                      color="success"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAction(request.id, "approved");
                                      }}
                                      disabled={loading[request.id]}
                                    >
                                      {loading[request.id] ? (
                                        <CSpinner size="sm" color="light" />
                                      ) : (
                                        <>
                                          <FontAwesomeIcon icon={faCheck} className="me-1" /> Approve
                                        </>
                                      )}
                                    </CButton>
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAction(request.id, "rejected");
                                      }}
                                      disabled={loading[request.id]}
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="me-1" /> Reject
                                    </CButton>
                                  </div>
                                )}
                              </CCol>
                            </CRow>
                          </div>
                        </CListGroupItem>
                      ))
                    ) : (
                      <div className="text-center p-5">
                        <FontAwesomeIcon 
                          icon={activeView === "pending" ? faClipboardList : faHistory} 
                          className="text-muted fs-1 mb-3" 
                        />
                        <h4 className="text-muted">
                          {activeView === "pending" 
                            ? "No pending requests" 
                            : historyFilter !== "all" 
                              ? `No ${historyFilter} requests found` 
                              : "No request history available"}
                        </h4> 
                      </div>
                    )}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>
          </motion.div>
        </CCol>
      </CRow>
    </CContainer>
  );
}