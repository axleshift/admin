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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSync,
  faCheckCircle,
  faHourglass,
  faExclamationCircle,
  faTimesCircle,
  faRobot,
  faBrain,
  faInfoCircle,
  faFileDownload,
  faListCheck,
  faPrint,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../utils/axiosInstance';

const AIComplaintsManager = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionItemsModal, setActionItemsModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [processingIds, setProcessingIds] = useState(new Set());

    // Fetch complaints on component mount only
    useEffect(() => {
        fetchComplains();
    }, []);

    const fetchComplains = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/complains/get-complains');
            setComplaints(response.data.complaints || []);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setError('Failed to load complaints. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const resolveComplaintWithAI = async (complaint) => {
        try {
            setError(null);
            // Update UI to show processing without changing the actual status
            setProcessingIds(prev => new Set(prev).add(complaint._id));

            const response = await axiosInstance.post('/complains/ai-resolve', {
                complaintText: complaint.complaintText,
                complaintId: complaint._id
            });
            
            // Update the complaint with the response data
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id 
                        ? response.data
                        : c
                )
            );
        } catch (error) {
            console.error('Error resolving with AI:', error);
            setError('Failed to resolve complaint. Please try again.');
        } finally {
            // Remove from processing set regardless of success/failure
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(complaint._id);
                return newSet;
            });
        }
    };

    // Resolution button handler
    const handleResolveClick = (complaint) => {
        if ((complaint.status === 'Needs AI Review' || complaint.status === 'Pending') && 
            !processingIds.has(complaint._id)) {
            resolveComplaintWithAI(complaint);
        }
    };

    // Handler for downloading resolution document
    const handleDownloadResolution = (complaintId) => {
        // Open in new tab/window
        window.open(`/api/complains/resolution-document/${complaintId}`, '_blank');
    };
    
    // Handler for viewing action items
    const handleViewActionItems = (complaint) => {
        setSelectedComplaint(complaint);
        setActionItemsModal(true);
    };
    
    // Handler for sending notification
    const handleSendNotification = async (complaintId) => {
        try {
            setError(null);
            
            // Display loading state for this specific notification
            setProcessingIds(prev => new Set(prev).add(`notify-${complaintId}`));
            
            // Find the complaint to get the email address
            const complaint = complaints.find(c => c._id === complaintId);
            if (!complaint) {
                throw new Error('Complaint not found');
            }
            
            // Log the email that will be used
            console.log(`Sending notification to: ${complaint.employeeEmail}`);
            
            const response = await axiosInstance.post('/complains/send-notification', {
                complaintId
            });
            
            // Show success message
            alert('Notification sent successfully to ' + complaint.employeeEmail);
        } catch (error) {
            console.error('Error sending notification:', error);
            setError(`Failed to send notification. Please try again. ${error.response?.data?.message || error.message}`);
        } finally {
            // Remove from processing set regardless of success/failure
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(`notify-${complaintId}`);
                return newSet;
            });
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch(status) {
            case 'Resolved': return 'success';
            case 'Under Review': return 'warning';
            case 'Dismissed': return 'danger';
            case 'Needs AI Review': return 'info';
            case 'Pending':
            default: return 'secondary';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch(status) {
            case 'Resolved': return faCheckCircle;
            case 'Under Review': return faHourglass;
            case 'Dismissed': return faTimesCircle;
            case 'Needs AI Review': return faBrain;
            case 'Pending':
            default: return faExclamationCircle;
        }
    };

    // Action Items Modal
    const renderActionItemsModal = () => {
        if (!selectedComplaint) return null;
        
        return (
            <CModal 
                visible={actionItemsModal} 
                onClose={() => setActionItemsModal(false)}
                size="lg"
            >
                <CModalHeader closeButton>
                    <CModalTitle>
                        <FontAwesomeIcon icon={faListCheck} className="me-2" />
                        Action Items for Complaint
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {selectedComplaint.actionItems && selectedComplaint.actionItems.length > 0 ? (
                        <CTable bordered striped responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Action</CTableHeaderCell>
                                    <CTableHeaderCell>Assigned To</CTableHeaderCell>
                                    <CTableHeaderCell>Due Date</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {selectedComplaint.actionItems.map((item, index) => (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{item.action}</CTableDataCell>
                                        <CTableDataCell>{item.assignedTo}</CTableDataCell>
                                        <CTableDataCell>{item.dueDate || 'ASAP'}</CTableDataCell>
                                        <CTableDataCell>
                                            <CFormCheck 
                                                id={`action-${index}`}
                                                label="Completed"
                                                checked={item.completed}
                                                disabled // For this example, just showing status
                                            />
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    ) : (
                        <p>No action items defined for this complaint.</p>
                    )}
                    
                    {selectedComplaint.followUpDate && (
                        <div className="mt-3">
                            <strong>Follow-up Date:</strong> {new Date(selectedComplaint.followUpDate).toLocaleDateString()}
                        </div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setActionItemsModal(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        );
    };

    return (
        <CContainer className="py-4">
            <CRow>
                <CCol>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>
                            <FontAwesomeIcon icon={faBrain} className="me-2" />
                            AI Complaints Resolution System
                        </h1>
                        <CTooltip content="This system only shows complaints that require advanced AI resolution due to their complexity or sensitivity." placement="bottom">
                            <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-info" style={{ cursor: 'pointer' }} />
                        </CTooltip>
                    </div>
                    
                    {error && (
                        <CAlert color="danger" className="mb-4">
                            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                            {error}
                        </CAlert>
                    )}
                    
                    <CButton 
                        color="primary"
                        onClick={fetchComplains} 
                        disabled={loading}
                        className="mb-4"
                    >
                        <FontAwesomeIcon icon={faSync} className="me-2" spin={loading} />
                        {loading ? 'Loading...' : 'Refresh Complaints'}
                    </CButton>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner />
                            <p className="mt-3">Loading complex complaints...</p>
                        </div>
                    ) : (
                        <>
                            {complaints.length === 0 ? (
                                <CAlert color="info">
                                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                                    No complex complaints found that require AI resolution.
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
                                                        Username: {complaint.isAnonymous ? 'Hidden' : complaint.employeeUsername}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                {complaint.hrNotes && (
                                                    <CTooltip content={`HR Notes: ${complaint.hrNotes}`} placement="top">
                                                        <span className="me-3 text-primary">
                                                            <FontAwesomeIcon icon={faInfoCircle} /> HR Forwarded
                                                        </span>
                                                    </CTooltip>
                                                )}
                                                {processingIds.has(complaint._id) ? (
                                                    <CBadge color="warning">
                                                        <FontAwesomeIcon icon={faHourglass} spin className="me-1" />
                                                        Processing
                                                    </CBadge>
                                                ) : (
                                                    <CBadge color={getStatusBadgeColor(complaint.status)}>
                                                        <FontAwesomeIcon icon={getStatusIcon(complaint.status)} className="me-1" />
                                                        {complaint.status}
                                                    </CBadge>
                                                )}
                                            </div>
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
                                                    <h6>AI Resolution:</h6>
                                                    <p className="mb-0">{complaint.resolutionText}</p>
                                                    
                                                    {/* Added buttons for document download, action items, and notifications */}
                                                    <div className="mt-3">
                                                        <CButton 
                                                            color="primary"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleDownloadResolution(complaint._id)}
                                                        >
                                                            <FontAwesomeIcon icon={faFileDownload} className="me-1" />
                                                            Download Document
                                                        </CButton>

                                                        {complaint.actionItems && complaint.actionItems.length > 0 && (
                                                            <CButton 
                                                                color="info"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handleViewActionItems(complaint)}
                                                            >
                                                                <FontAwesomeIcon icon={faListCheck} className="me-1" />
                                                                View Action Items
                                                            </CButton>
                                                        )}
                                                        
                                                        {complaint.source === 'Employee Complaint' && !complaint.isAnonymous && (
                                                            <CButton 
                                                                color="success"
                                                                size="sm"
                                                                onClick={() => handleSendNotification(complaint._id)}
                                                                disabled={processingIds.has(`notify-${complaint._id}`)}
                                                            >
                                                                <FontAwesomeIcon 
                                                                    icon={processingIds.has(`notify-${complaint._id}`) ? faHourglass : faEnvelope} 
                                                                    spin={processingIds.has(`notify-${complaint._id}`)}
                                                                    className="me-1" 
                                                                />
                                                                {processingIds.has(`notify-${complaint._id}`) ? 'Sending...' : 'Send Notification'}
                                                            </CButton>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {(complaint.status === 'Needs AI Review' || complaint.status === 'Pending') && (
                                                <CButton 
                                                    color="success"
                                                    size="sm"
                                                    onClick={() => handleResolveClick(complaint)}
                                                    className="mt-3"
                                                    disabled={processingIds.has(complaint._id)}
                                                >
                                                    {processingIds.has(complaint._id) ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faHourglass} spin className="me-2" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faRobot} className="me-2" />
                                                            Resolve with Advanced AI
                                                        </>
                                                    )}
                                                </CButton>
                                            )}
                                        </CCardBody>
                                    </CCard>
                                ))
                            )}
                        </>
                    )}
                </CCol>
            </CRow>
            
            {/* Added the action items modal to the component */}
            {renderActionItemsModal()}
        </CContainer>
    );
};

export default AIComplaintsManager;