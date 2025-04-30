import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CBadge,
  CAlert,
  CTooltip,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSync,
  faCheckCircle,
  faHourglass,
  faExclamationCircle,
  faTimesCircle,
  faForward,
  faBrain,
  faUserTie,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../../utils/axiosInstance';

const HRComplaintsManager = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [forwardModal, setForwardModal] = useState(false);
    const [hrNotes, setHrNotes] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Fetch complaints on component mount only
    useEffect(() => {
        fetchHRComplaints();
    }, []);

    const fetchHRComplaints = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/complains/hr-complains');
            setComplaints(response.data.complaints || []);
        } catch (error) {
            console.error('Error fetching HR complaints:', error);
            setError({
                type: 'danger',
                message: 'Failed to load complaints. Please try again.'
            });
        } finally {
            setLoading(false);
            setProcessingId(null);
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch(status) {
            case 'Resolved': return 'success';
            case 'Processing': 
            case 'Under Review': return 'warning';
            case 'Dismissed': return 'danger';
            case 'HR Review': return 'info';
            case 'Pending':
            default: return 'secondary';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch(status) {
            case 'Resolved': return faCheckCircle;
            case 'Processing': 
            case 'Under Review': return faHourglass;
            case 'Dismissed': return faTimesCircle;
            case 'HR Review': return faUserTie;
            case 'Pending':
            default: return faExclamationCircle;
        }
    };

    // Handle forwarding a complaint to the AI system
    const handleForwardToAI = async () => {
        if (!selectedComplaint) return;
        
        try {
            setProcessingId(selectedComplaint._id);
            setError(null);
            
            const response = await axiosInstance.post('/complains/forward-to-ai', {
                complaintId: selectedComplaint._id,
                hrNotes: hrNotes
            });
            
            // Remove the forwarded complaint from the list
            setComplaints(prevComplaints => 
                prevComplaints.filter(c => c._id !== selectedComplaint._id)
            );
            
            // Close modal and reset
            setForwardModal(false);
            setHrNotes('');
            setSelectedComplaint(null);
            
            // Show success message
            setError({type: 'success', message: 'Complaint successfully forwarded to AI resolution system'});
            
        } catch (error) {
            console.error('Error forwarding complaint:', error);
            setError({type: 'danger', message: 'Failed to forward complaint. Please try again.'});
        } finally {
            setProcessingId(null);
        }
    };

    // Regular HR resolution (simplified for demo)
    const resolveWithHR = async (complaint) => {
        try {
            setProcessingId(complaint._id);
            setError(null);
            
            // Simple resolution - in a real app, this would have more HR-specific logic
            const updatedComplaint = {
                ...complaint,
                status: 'Resolved',
                resolutionText: 'This complaint has been reviewed and resolved by HR. Appropriate action has been taken.'
            };
            
            // Update in UI
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id ? updatedComplaint : c
                )
            );
            
            // In a real app, you would send this to the backend
            // await axiosInstance.post('/complains/hr-resolve', { complaintId: complaint._id });
            
        } catch (error) {
            console.error('Error resolving with HR:', error);
            setError({type: 'danger', message: 'Failed to resolve complaint. Please try again.'});
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <CContainer className="py-4">
            <CRow>
                <CCol>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>
                            <FontAwesomeIcon icon={faUserTie} className="me-2" />
                            HR Complaints Management
                        </h1>
                        <CTooltip content="This system shows standard complaints that can be handled by HR. Complex cases can be forwarded to the AI system." placement="bottom">
                            <FontAwesomeIcon icon={faExclamationCircle} className="ms-2 text-info" style={{ cursor: 'pointer' }} />
                        </CTooltip>
                    </div>
                    
                    {error && (
                        <CAlert color={error.type || "danger"} className="mb-4">
                            <FontAwesomeIcon 
                                icon={error.type === 'success' ? faCheckCircle : faExclamationCircle} 
                                className="me-2" 
                            />
                            {error.message}
                        </CAlert>
                    )}
                    
                    <CButton 
                        color="primary"
                        onClick={fetchHRComplaints} 
                        disabled={loading}
                        className="mb-4"
                    >
                        <FontAwesomeIcon icon={faSync} className="me-2" spin={loading} />
                        {loading ? 'Loading...' : 'Refresh Complaints'}
                    </CButton>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner />
                            <p className="mt-3">Loading HR complaints...</p>
                        </div>
                    ) : (
                        <>
                            {complaints.length === 0 ? (
                                <CAlert color="info">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                                    No complaints found that require HR handling.
                                </CAlert>
                            ) : (
                                complaints.map((complaint) => (
                                    <CCard key={complaint._id} className="mb-4">
                                        <CCardHeader className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>
                                                    {complaint.source === 'Employee Complaint' ? 
                                                        (complaint.isAnonymous ? 'Anonymous' : complaint.employeeName) : 
                                                        complaint.userId}
                                                </strong>
                                                {complaint.source === 'Employee Complaint' && (
                                                    <span className="ms-3 text-muted">
                                                        ID: {complaint.isAnonymous ? 'Hidden' : complaint.employeeId}
                                                    </span>
                                                )}
                                            </div>
                                            <CBadge color={getStatusBadgeColor(complaint.status)}>
                                                <FontAwesomeIcon icon={getStatusIcon(complaint.status)} className="me-1" />
                                                {complaint.status}
                                            </CBadge>
                                        </CCardHeader>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <small className="text-muted d-block mb-2">
                                                    Source: {complaint.source}
                                                    {complaint.source === 'Employee Complaint' && (
                                                        <>
                                                            {' • '}Department: {complaint.department}
                                                            {' • '}Type: {complaint.complaintType}
                                                            {' • '}Urgency: <CBadge color={
                                                                complaint.urgency === 'Critical' ? 'danger' :
                                                                complaint.urgency === 'High' ? 'warning' :
                                                                complaint.urgency === 'Medium' ? 'info' : 'secondary'
                                                            } shape="rounded-pill">{complaint.urgency}</CBadge>
                                                        </>
                                                    )}
                                                </small>
                                                <p className="mb-0">{complaint.complaintText}</p>
                                            </div>
                                            
                                            {complaint.resolutionText && (
                                                <div className="mt-3 p-3 bg-light rounded">
                                                    <h6>Resolution:</h6>
                                                    <p className="mb-0">{complaint.resolutionText}</p>
                                                </div>
                                            )}
                                            
                                            {(complaint.status === 'HR Review' || complaint.status === 'Pending') && (
                                                <div className="mt-3">
                                                    <CButton 
                                                        color="primary"
                                                        size="sm"
                                                        onClick={() => resolveWithHR(complaint)}
                                                        className="me-2"
                                                        disabled={processingId === complaint._id}
                                                    >
                                                        <FontAwesomeIcon icon={faUserTie} className="me-2" />
                                                        {processingId === complaint._id ? 'Processing...' : 'Resolve with HR'}
                                                    </CButton>
                                                    
                                                    <CButton 
                                                        color="warning"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint);
                                                            setForwardModal(true);
                                                        }}
                                                        disabled={processingId === complaint._id}
                                                    >
                                                        <FontAwesomeIcon icon={faForward} className="me-2" />
                                                        Forward to AI
                                                    </CButton>
                                                </div>
                                            )}
                                        </CCardBody>
                                    </CCard>
                                ))
                            )}
                        </>
                    )}
                </CCol>
            </CRow>
            
            {/* Forward to AI Modal */}
            <CModal 
                visible={forwardModal} 
                onClose={() => {
                    setForwardModal(false);
                    setHrNotes('');
                    setSelectedComplaint(null);
                }}
            >
                <CModalHeader closeButton>
                    <CModalTitle>Forward Complaint to AI Resolution System</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p>
                        This complaint will be forwarded to the AI resolution system for specialized handling.
                        Please provide any notes or context that might help with the resolution.
                    </p>
                    <div className="mb-3">
                        <label htmlFor="hrNotes" className="form-label">
                            <FontAwesomeIcon icon={faComment} className="me-1" /> HR Notes
                        </label>
                        <CFormTextarea
                            id="hrNotes"
                            rows="4"
                            value={hrNotes}
                            onChange={(e) => setHrNotes(e.target.value)}
                            placeholder="Explain why this complaint needs AI handling..."
                        />
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton 
                        color="secondary" 
                        onClick={() => {
                            setForwardModal(false);
                            setHrNotes('');
                            setSelectedComplaint(null);
                        }}
                    >
                        Cancel
                    </CButton>
                    <CButton 
                        color="primary" 
                        onClick={handleForwardToAI}
                        disabled={processingId === (selectedComplaint?._id)}
                    >
                        {processingId === (selectedComplaint?._id) ? (
                            <>
                                <CSpinner size="sm" className="me-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faBrain} className="me-2" />
                                Forward to AI
                            </>
                        )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CContainer>
    );
};

export default HRComplaintsManager;