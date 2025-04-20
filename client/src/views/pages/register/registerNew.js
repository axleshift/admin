import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CTooltip,
  CContainer,
  CRow,
  CCol
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, 
  faClipboard, 
  faExclamationCircle, 
  faCheckCircle, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';

const NewUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchNewUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/client/new-users');
        setUsers(response.data.users);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch newly registered users');
        console.error('Error fetching new users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewUsers();
  }, [refreshTrigger]);

  const handleProcessRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/client/process-registrations');
      alert(`Processing complete: ${response.data.message}`);
      // Trigger a refresh of the user list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process registrations');
      console.error('Error processing registrations:', err);
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <CContainer fluid className="px-4">
      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol>
              <h2 className="mb-0">Newly Registered Users</h2>
            </CCol>
            <CCol className="d-flex justify-content-end">
              <CButton 
                color="primary"
                onClick={handleProcessRegistrations}
                disabled={loading}
                className="me-2"
              >
                <FontAwesomeIcon icon={loading ? faSpinner : faSync} spin={loading} className="me-2" />
                Process Pending Registrations
              </CButton>
              <CButton 
                color="success"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Refresh List
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger">
              {error}
            </CAlert>
          )}

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <strong>Total Users:</strong> {users.length}
              </div>

              <CTable hover responsive bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Password</CTableHeaderCell>
                    <CTableHeaderCell>Registration Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <CTableRow key={user._id}>
                        <CTableDataCell>
                          {user.firstName} {user.lastName}
                        </CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{user.role}</CTableDataCell>
                        <CTableDataCell>{user.department}</CTableDataCell>
                        <CTableDataCell>
                          {user.generatedPassword ? (
                            <div className="d-flex align-items-center">
                              <span className="bg-light px-2 py-1 rounded">
                                {user.generatedPassword}
                              </span>
                              <CButton 
                                color="link"
                                onClick={() => {
                                  navigator.clipboard.writeText(user.generatedPassword);
                                  alert('Password copied to clipboard!');
                                }}
                                title="Copy to clipboard"
                              >
                                <FontAwesomeIcon icon={faClipboard} />
                              </CButton>
                            </div>
                          ) : (
                            <span className="text-muted">Not available</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(user.registrationDate)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {user.registrationError ? (
                            <CTooltip content={user.registrationError}>
                              <CBadge color="danger">
                                <FontAwesomeIcon icon={faExclamationCircle} className="me-1" /> Error
                              </CBadge>
                            </CTooltip>
                          ) : (
                            <CBadge color="success">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Success
                            </CBadge>
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                        No registered users found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default NewUsersPage;