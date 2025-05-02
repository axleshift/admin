import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CListGroup, 
  CListGroupItem, 
  CButton,
  CCollapse,
  CSpinner,
  CAlert,
  CBadge,
  CRow,
  CCol
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faChevronDown, 
  faChevronUp, 
  faCheckCircle, 
  faUserPlus,
  faUserCheck,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

function NewHiresList() {
  const [newHires, setNewHires] = useState([]);
  const [error, setError] = useState(null);
  const [expandedHires, setExpandedHires] = useState({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const fetchNewHires = () => {
    setLoading(true);
    axiosInstance.get('/hr/newhires')
      .then(res => {
        setNewHires(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNewHires();
  }, []);

  const handleRegister = () => {
    setRegistering(true);
    setRegistrationResult(null);
    
    axiosInstance.post('/client/process-registrations')
      .then(res => {
        console.log("Registration response:", res.data);
        setRegistrationResult({
          success: res.data.success,
          message: res.data.message,
          registeredUsers: res.data.registeredUsers || [],
          alreadyRegistered: res.data.alreadyRegistered || []
        });
        
        // Combine all emails that have registration status (new + already registered)
        const allRegisteredEmails = new Set([
          ...(res.data.registeredUsers || []).map(user => user.email),
          ...(res.data.alreadyRegistered || []).map(user => user.email)
        ]);
        
        // Update the new hires list with registration status
        if (allRegisteredEmails.size > 0) {
          // Mark registered users in the current list
          setNewHires(prevHires => 
            prevHires.map(hire => {
              if (allRegisteredEmails.has(hire.email)) {
                // Find if this is a newly registered user to get the generated password
                const registeredUser = res.data.registeredUsers?.find(
                  user => user.email === hire.email
                );
                
                return {
                  ...hire,
                  registered: true,
                  // Only set password if it's a newly registered user
                  ...(registeredUser ? { generatedPassword: registeredUser.generatedPassword || '' } : {})
                };
              }
              return hire;
            })
          );
        } else {
          // If no users were registered, refresh the list anyway
          // in case the backend updated any status
          fetchNewHires();
        }
        
        setRegistering(false);
      })
      .catch(err => {
        console.error("Registration error:", err);
        setRegistrationResult({
          success: false,
          message: err.response?.data?.message || err.message
        });
        setRegistering(false);
      });
  };
  
  const toggleHireDetails = (id) => {
    setExpandedHires(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return (
    <div className="d-flex justify-content-center p-4">
      <CSpinner color="primary" />
    </div>
  );
  
  if (error) return (
    <CCard color="danger" className="text-white">
      <CCardBody>Error: {error}</CCardBody>
    </CCard>
  );

  // Count registered and unregistered hires
  const registeredCount = newHires.filter(hire => hire.registered).length;
  const unregisteredCount = newHires.length - registeredCount;

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="m-0">New Hires</h2>
          <div className="mt-1">
            <CBadge color="success" className="me-2">
              {registeredCount} Registered
            </CBadge>
            <CBadge color="info">
              {unregisteredCount} Pending Registration
            </CBadge>
          </div>
        </div>
        <CButton 
          color="primary"
          onClick={handleRegister}
          disabled={registering || newHires.every(hire => hire.registered)}
        >
          {registering ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Registering...
            </>
          ) : newHires.every(hire => hire.registered) ? (
            'All Hires Registered'
          ) : (
            <>
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              Register New Hires
            </>
          )}
        </CButton>
      </CCardHeader>
      
      <CCardBody>
        {registrationResult && (
          <CAlert color={registrationResult.success ? "success" : "danger"} className="mb-3">
            <div className="d-flex align-items-center">
              {registrationResult.success && (
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              )}
              {registrationResult.message}
            </div>
            
            {/* Display newly registered users */}
            {registrationResult.success && registrationResult.registeredUsers?.length > 0 && (
              <div className="mt-2">
                <div className="fw-bold">Newly registered users:</div>
                <ul className="mt-1">
                  {registrationResult.registeredUsers.map((user, idx) => (
                    <li key={`new-${idx}`}>
                      {user.firstName} {user.lastName} ({user.email}) - 
                      Password: <code className="bg-light px-2 py-1 rounded">{user.generatedPassword}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Display already registered users */}
            {registrationResult.success && registrationResult.alreadyRegistered?.length > 0 && (
              <div className="mt-2">
                <div className="fw-bold">Already registered users:</div>
                <ul className="mt-1">
                  {registrationResult.alreadyRegistered.map((user, idx) => (
                    <li key={`existing-${idx}`}>
                      {user.firstName} {user.lastName} ({user.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CAlert>
        )}
        
        {newHires.length === 0 ? (
          <p className="text-muted">No new hires found.</p>
        ) : (
          <CListGroup>
            {newHires.map((hire, idx) => (
              <CListGroupItem key={idx} className={`mb-2 ${hire.registered ? 'border-success' : ''}`}>
                {/* Enhanced card header for new hires with clear registration status */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className={`me-3 p-2 rounded-circle 
                      ${hire.registered ? 'bg-success text-white' : 'bg-light'}`}>
                      <FontAwesomeIcon 
                        icon={hire.registered ? faUserCheck : faUser} 
                        size="lg"
                      />
                    </div>
                    <div>
                      <div className="fw-bold">
                        {hire.firstName 
                          ? `${hire.firstName} ${hire.lastName}`
                          : hire.name || `New Hire #${idx + 1}`}
                      </div>
                      <div className="text-muted small">
                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                        {hire.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    {/* Registration status badge */}
                    <CBadge 
                      color={hire.registered ? "success" : "info"} 
                      className="me-3 px-3 py-2"
                    >
                      {hire.registered ? 'Registered' : 'Pending Registration'}
                    </CBadge>
                    
                    {/* View details button */}
                    <CButton 
                      color={hire.registered ? "success" : "primary"}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHireDetails(idx)}
                      className="d-flex align-items-center"
                    >
                      {expandedHires[idx] ? (
                        <>
                          Hide Details
                          <FontAwesomeIcon icon={faChevronUp} className="ms-1" />
                        </>
                      ) : (
                        <>
                          View Details
                          <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
                        </>
                      )}
                    </CButton>
                  </div>
                </div>
                
                <CCollapse visible={expandedHires[idx]}>
                  <div className="mt-3 p-3 bg-light rounded">
                    <CRow>
                      <CCol md={6}>
                        {hire.governmentIds && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Government IDs:</div>
                            <div>{JSON.stringify(hire.governmentIds)}</div>
                          </div>
                        )}
                        {hire._id && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">ID:</div>
                            <div>{hire._id}</div>
                          </div>
                        )}
                        {hire.employeeId && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Employee ID:</div>
                            <div>{hire.employeeId}</div>
                          </div>
                        )}
                        {hire.firstName && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">First Name:</div>
                            <div>{hire.firstName}</div>
                          </div>
                        )}
                        {hire.lastName && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Last Name:</div>
                            <div>{hire.lastName}</div>
                          </div>
                        )}
                        {hire.middleName && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Middle Name:</div>
                            <div>{hire.middleName}</div>
                          </div>
                        )}
                        {hire.position && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Position (Role):</div>
                            <div>{hire.position}</div>
                          </div>
                        )}
                      </CCol>
                      <CCol md={6}>
                        {hire.department && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Department:</div>
                            <div>{hire.department}</div>
                          </div>
                        )}
                        {hire.employmentStatus && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Employment Status:</div>
                            <div>{hire.employmentStatus}</div>
                          </div>
                        )}
                        {hire.dateHired && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Date Hired:</div>
                            <div>{hire.dateHired}</div>
                          </div>
                        )}
                        {hire.email && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Email:</div>
                            <div>{hire.email}</div>
                          </div>
                        )}
                        {hire.phoneNumber && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Phone Number:</div>
                            <div>{hire.phoneNumber}</div>
                          </div>
                        )}
                        {hire.address && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Address:</div>
                            <div>{hire.address}</div>
                          </div>
                        )}
                        {hire.registered && (
                          <div className="mb-2">
                            <div className="fw-bold text-muted">Registration Status:</div>
                            <div className="text-success fw-bold">Registered</div>
                            {hire.generatedPassword && (
                              <div className="mt-1">
                                <div className="fw-bold text-muted">Generated Password:</div>
                                <div className="bg-white p-2 rounded border">
                                  <code>{hire.generatedPassword}</code>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CCol>
                    </CRow>
                  </div>
                </CCollapse>
              </CListGroupItem>
            ))}
          </CListGroup>
        )}
      </CCardBody>
    </CCard>
  );
}

export default NewHiresList;