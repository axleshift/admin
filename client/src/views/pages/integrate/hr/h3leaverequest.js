import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CForm, 
  CFormInput, 
  CFormSelect, 
  CButton, 
  CCol, 
  CRow, 
  CSpinner,
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const LeaveRequestUpdate = ({ leaveRequestId, onUpdateSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Axios instance with base configuration
  const api = axios.create({
    baseURL: 'https://hr3.axleshift.com/api',
    headers: {
      'Content-Type': 'application/json',
      // Add any necessary authentication headers
      // 'Authorization': `Bearer ${yourAuthToken}`
    }
  });

  useEffect(() => {
    // Validate leaveRequestId
    if (!leaveRequestId) {
      setError('No Leave Request ID provided');
      setLoading(false);
      return;
    }

    // Fetch existing leave request data
    const fetchLeaveRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/leave-requests/${leaveRequestId}`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.response 
          ? err.response.data.message || 'Failed to fetch leave request' 
          : 'Network error occurred'
        );
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, [leaveRequestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/leave-requests/${leaveRequestId}`, formData);
      // Call success callback if provided
      if (onUpdateSuccess) {
        onUpdateSuccess(response.data);
      }
      setIsEditable(false);
    } catch (err) {
      console.error('Update Error:', err);
      setError(err.response 
        ? err.response.data.message || 'Failed to update leave request' 
        : 'Network error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // If onCancel prop is provided, call it
    if (onCancel) {
      onCancel();
    }
    // Reset editability
    setIsEditable(false);
  };

  // Render error message
  if (error) {
    return (
      <CCard>
        <CCardBody>
          <CAlert color="danger">{error}</CAlert>
        </CCardBody>
      </CCard>
    );
  }

  // Loading state
  if (loading) {
    return (
      <CCard>
        <CCardBody className="text-center">
          <CSpinner color="primary" />
          <p className="mt-2">Loading leave request details...</p>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Leave Request Details</strong>
        {!isEditable && (
          <CButton 
            color="primary" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditable(true)}
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Edit
          </CButton>
        )}
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md="6">
              <CFormInput
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                disabled
              />
            </CCol>
            <CCol md="6">
              <CFormSelect
                label="Leave Type"
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                disabled={!isEditable}
              >
                <option value="">Select Leave Type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md="6">
              <CFormInput
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </CCol>
            <CCol md="6">
              <CFormInput
                type="date"
                label="End Date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormInput
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for leave"
                disabled={!isEditable}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!isEditable}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {isEditable && (
            <CRow>
              <CCol className="d-flex justify-content-end">
                <CButton 
                  color="secondary" 
                  onClick={handleCancel}
                  className="me-2"
                >
                  Cancel
                </CButton>
                <CButton 
                  color="primary" 
                  type="submit"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Changes
                </CButton>
              </CCol>
            </CRow>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  );
};

// PropTypes validation
LeaveRequestUpdate.propTypes = {
  leaveRequestId: PropTypes.string.isRequired,
  onUpdateSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

export default LeaveRequestUpdate;