import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from '../../../../utils/activityLogger';
import { 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CButton,
  CBadge,
  CCollapse,
  CCardFooter,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEdit, 
  faTrash, 
  faCar, 
  faGasPump, 
  faCalendarAlt, 
  faIdCard,
  faPlus,
  faChevronDown,
  faChevronUp,
  faUser,
  faClipboard,
  faTools,
  faCheckCircle,
  faExclamationTriangle,
  faExclamationCircle,
  faFileExcel,
  faPrint,
  faInfoCircle,
  faMapMarkerAlt,
  faTag,
  faDownload,
  faLock
} from '@fortawesome/free-solid-svg-icons';

const VehicleDataPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);
  const [showToast, setShowToast] = useState(false);
  
  // User information (should be retrieved from your auth context/state)
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name');
  const userUsername = localStorage.getItem('username');
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/logistics/vehicle');
        
        if (response.data.success && response.data.data.success) {
          setVehicles(response.data.data.data);
          
          // Create and show toast
          setToast({
            color: 'success',
            title: 'Success',
            content: 'Vehicle data has been successfully loaded!'
          });
          setShowToast(true);
          
          // Log activity for viewing vehicle data
          logActivity({
            name: userName,
            role: userRole,
            department: userDepartment,
            route: '/vehicles',
            action: 'View Vehicles',
            description: `${userName} viewed vehicle fleet data`
          }).catch(console.warn);
          
        } else {
          setError('Failed to fetch vehicle data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching vehicle data');
        console.error('Error fetching vehicles:', err);
        
        // Create error toast
        setToast({
          color: 'danger',
          title: 'Error',
          content: 'Failed to load vehicle data'
        });
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [userName, userRole, userDepartment]);

  // Function to download vehicles data as secure ZIP
  const handleDownloadSecureZip = async (downloadType) => {
    try {
      setIsDownloading(true);
      
      // Get the download type and set file name
      let fileName = '';
      
      switch(downloadType) {
        case 'all': 
          fileName = 'All_Vehicles'; 
          break;
        case 'available': 
          fileName = 'Available_Vehicles'; 
          break;
        case 'in_use': 
          fileName = 'InUse_Vehicles';
          break;
        case 'maintenance': 
          fileName = 'Maintenance_Vehicles';
          break;
        case 'forRegistration': 
          fileName = 'ForRegistration_Vehicles';
          break;
        default:
          fileName = 'Vehicles';
      }
      
      // Send request to server
      const response = await axiosInstance.post(
        '/management/downloadVehicleZip',
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
      
      // Log activity for secure download
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/vehicles',
        action: 'Download Protected Data',
        description: `Downloaded ${fileName} as password-protected zip`
      }).catch(console.warn);
      
      // Show success toast
      setToast({
        color: 'success',
        title: 'Success',
        content: `File ${fileName}_Protected.zip downloaded successfully!`
      });
      setShowToast(true);
      
    } catch (err) {
      console.error('Error creating protected zip:', err);
      
      // Show error toast
      setToast({
        color: 'danger',
        title: 'Error',
        content: 'Failed to create protected download. Please try again.'
      });
      setShowToast(true);
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to handle vehicle actions (view, edit, delete)
  const handleVehicleAction = (action, vehicle) => {
    // Implement action handling based on your app's requirements
    
    // Log activity based on the action
    const actionDescriptions = {
      'view': `Viewed details for vehicle ${vehicle.regisNumber || vehicle._id}`,
      'edit': `Initiated editing vehicle ${vehicle.regisNumber || vehicle._id}`,
      'delete': `Initiated deletion of vehicle ${vehicle.regisNumber || vehicle._id}`
    };
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/vehicles',
      action: `Vehicle ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: actionDescriptions[action]
    }).catch(console.warn);
  };

  // Function to handle card expansion
  const toggleCard = (vehicleId) => {
    if (expandedCard === vehicleId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(vehicleId);
      
      // Log activity for expanding a vehicle card
      const vehicle = vehicles.find(v => v._id === vehicleId);
      if (vehicle) {
        logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: '/vehicles',
          action: 'View Vehicle Details',
          description: `${userName} Expanded details for vehicle ${vehicle.regisNumber || vehicleId}`
        }).catch(console.warn);
      }
    }
  };

  // Function to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to get badge color based on status
  const getBadgeColor = (status) => {
    const statusMap = {
      'available': 'success',
      'in_use': 'primary',
      'forRegistration': 'warning',
      'maintenance': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  // Function to get status icon based on status
  const getStatusIcon = (status) => {
    const statusIconMap = {
      'available': faCheckCircle,
      'in_use': faInfoCircle,
      'forRegistration': faExclamationTriangle,
      'maintenance': faTools
    };
    return statusIconMap[status] || faExclamationCircle;
  };

  // Function to render status badge
  const renderStatusBadge = (status) => (
    <CBadge color={getBadgeColor(status)}>
      <FontAwesomeIcon icon={getStatusIcon(status)} className="me-1" />
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </CBadge>
  );

  // All fields for the expanded view
  const allFields = [
    {key: 'idNum', label: 'ID', icon: faIdCard},
    {key: 'brand', label: 'Brand', icon: faTag},
    {key: 'model', label: 'Model', icon: faCar},
    {key: 'year', label: 'Year', icon: faCalendarAlt},
    {key: 'type', label: 'Type', icon: faCar},
    {key: 'capacity', label: 'Capacity (kg)', icon: faInfoCircle},
    {key: 'fuelType', label: 'Fuel Type', icon: faGasPump},
    {key: 'currentMileage', label: 'Mileage (km)', icon: faMapMarkerAlt},
  ];

  return (
    <div className="container-fluid p-4">
      {/* Simple Toast Implementation */}
      {showToast && toast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div 
            className={`toast show align-items-center text-white bg-${toast.color} border-0`}
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">
                <strong>{toast.title}</strong>: {toast.content}
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto" 
                onClick={() => setShowToast(false)}
              ></button>
            </div>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-light">
          <FontAwesomeIcon icon={faCar} className="me-3 text-info" />
          Vehicle Fleet Management
        </h1>
      </div>
      
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <CSpinner color="info" />
        </div>
      )}
      
      {error && (
        <CAlert color="danger" className="mb-4">
          <strong>Error: </strong>
          <span>{error}</span>
        </CAlert>
      )}
      
      {!loading && !error && vehicles && vehicles.length === 0 && (
        <CAlert color="warning" className="mb-4">
          <p>No vehicle data available.</p>
        </CAlert>
      )}
      
      {!loading && !error && vehicles && vehicles.length > 0 && (
        <>
          <CCard className="shadow mb-4 bg-dark text-light border-dark">
            <CCardHeader className="bg-dark border-secondary">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  <FontAwesomeIcon icon={faCar} className="me-2 text-info" />
                  Total Vehicles: {vehicles.filter(v => !v.deleted).length}
                </span>
                <div className="d-flex gap-2">
                  {/* Dropdown for secure downloads */}
                  <CDropdown>
                    <CDropdownToggle color="dark" disabled={isDownloading}>
                      <FontAwesomeIcon icon={faLock} className="me-2" color="success" />
                      Secure Download
                      {isDownloading && <CSpinner size="sm" className="ms-2" />}
                    </CDropdownToggle>
                    <CDropdownMenu className="bg-dark">
                      <CDropdownItem className="text-light" onClick={() => handleDownloadSecureZip('all')}>All Vehicles</CDropdownItem>
                      <CDropdownItem className="text-light" onClick={() => handleDownloadSecureZip('available')}>Available Vehicles</CDropdownItem>
                      <CDropdownItem className="text-light" onClick={() => handleDownloadSecureZip('in_use')}>In-Use Vehicles</CDropdownItem>
                      <CDropdownItem className="text-light" onClick={() => handleDownloadSecureZip('maintenance')}>Maintenance Vehicles</CDropdownItem>
                      <CDropdownItem className="text-light" onClick={() => handleDownloadSecureZip('forRegistration')}>For Registration Vehicles</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </div>
              </div>
            </CCardHeader>
          </CCard>

          <CRow>
            {vehicles.filter(vehicle => !vehicle.deleted).map((vehicle) => (
              <CCol key={vehicle._id} sm={12} className="mb-4">
                <CCard 
                  className="shadow-sm border-dark bg-dark text-light border-top-0 border-left-0 border-right-0 border-bottom border-info" 
                  style={{ cursor: 'pointer', borderWidth: '3px' }}
                >
                  <div className="d-flex flex-row">
                    <div className="bg-secondary d-flex align-items-center justify-content-center" style={{ width: '120px', minHeight: '100%' }}>
                      <FontAwesomeIcon icon={faCar} size="3x" className="text-info" />
                    </div>
                    <div className="flex-grow-1">
                      <CCardHeader className="d-flex justify-content-between align-items-center bg-dark border-0">
                        <div>
                          <h5 className="mb-0">
                            <FontAwesomeIcon icon={faClipboard} className="me-2 text-info" />
                            {vehicle.regisNumber || 'No Registration'}
                          </h5>
                        </div>
                        <div className="d-flex align-items-center">
                          {renderStatusBadge(vehicle.status || 'unknown')}
                          <CButton 
                            color="link" 
                            className="p-0 ms-3 text-info"
                            onClick={() => toggleCard(vehicle._id)}
                          >
                            <FontAwesomeIcon 
                              icon={expandedCard === vehicle._id ? faChevronUp : faChevronDown} 
                              size="lg"
                            />
                          </CButton>
                        </div>
                      </CCardHeader>
                      <CCardBody className="py-2 bg-dark text-light">
                        <div className="d-flex justify-content-between">
                          <div className="me-3">
                            <div className="text-info small mb-1">Driver</div>
                            <div>
                              <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
                              <strong>{vehicle.driver || 'Not Assigned'}</strong>
                            </div>
                          </div>
                          
                          <div className="me-3">
                            <div className="text-info small mb-1">Registration Expiry</div>
                            <div>
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                              <strong>{formatDate(vehicle.regisExprationDate)}</strong>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-info small mb-1">Brand & Model</div>
                            <div>
                              <FontAwesomeIcon icon={faTag} className="me-2 text-light" />
                              <strong>{(vehicle.brand || '') + ' ' + (vehicle.model || '')}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <CCollapse visible={expandedCard === vehicle._id}>
                          <hr className="my-3 border-secondary" />
                          
                          <div className="row">
                            {allFields.filter(field => 
                              !['regisNumber', 'driver', 'regisExprationDate', 'status', 'brand', 'model'].includes(field.key)
                            ).map(field => (
                              <div key={field.key} className="col-md-4 mb-3">
                                <div className="text-info small mb-1">{field.label}</div>
                                <div>
                                  {field.icon && <FontAwesomeIcon icon={field.icon} className="me-2 text-info" />}
                                  <strong>{vehicle[field.key] || 'N/A'}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CCollapse>
                      </CCardBody>
                      {expandedCard === vehicle._id && (
                        <CCardFooter className="bg-dark border-secondary d-flex justify-content-end gap-2 py-2">
                          <CButton 
                            color="info" 
                            size="sm"
                            onClick={() => handleVehicleAction('view', vehicle)}
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" /> View
                          </CButton>
                          <CButton 
                            color="success" 
                            size="sm"
                            onClick={() => handleVehicleAction('edit', vehicle)}
                          >
                            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                          </CButton>
                          <CButton 
                            color="danger" 
                            size="sm"
                            onClick={() => handleVehicleAction('delete', vehicle)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                          </CButton>
                        </CCardFooter>
                      )}
                    </div>
                  </div>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </>
      )}
      
      {/* Password Modal */}
      <CModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} dark>
        <CModalHeader closeButton className="bg-dark text-light border-secondary">
          <CModalTitle>Password Protected File</CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-dark text-light">
          <p>Your file <strong>{downloadFileName}</strong> has been downloaded successfully.</p>
          <p>Use the following password to unlock the ZIP file:</p>
          <CAlert color="info" className="d-flex align-items-center bg-secondary">
            <FontAwesomeIcon icon={faLock} className="me-3 fs-4" />
            <div className="font-monospace fw-bold">{downloadPassword}</div>
          </CAlert>
          <p className="text-muted small">This password is unique to your account. Please keep it secure.</p>
        </CModalBody>
        <CModalFooter className="bg-dark border-secondary">
          <CButton color="secondary" onClick={() => setShowPasswordModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
  
export default VehicleDataPage;