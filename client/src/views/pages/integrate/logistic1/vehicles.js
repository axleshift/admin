import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
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
  CModalTitle
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
  
  // User information (should be retrieved from your auth context/state)
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'employee';
  const userUsername = localStorage.getItem('userUsername') || 'user123';
  const userDepartment = localStorage.getItem('userDepartment') || 'Logistics';

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/logistics/vehicle');
        
        if (response.data.success && response.data.data.success) {
          setVehicles(response.data.data.data);
        } else {
          setError('Failed to fetch vehicle data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching vehicle data');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Function to log user activity
  const logActivity = async (activity) => {
    try {
      await axiosInstance.post('/logs/activity', activity);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

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
      
      // Log activity
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/vehicles',
        action: 'Download Protected Data',
        description: `Downloaded ${fileName} as password-protected zip`
      });
      
    } catch (err) {
      console.error('Error creating protected zip:', err);
      alert('Failed to create protected download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to download vehicles data as CSV directly
  const handleDownload = (downloadType) => {
    let dataToDownload = [];
    let fileName = '';
    
    // Filter the data based on downloadType
    switch(downloadType) {
      case 'all':
        dataToDownload = vehicles.filter(v => !v.deleted);
        fileName = 'All_Vehicles';
        break;
      case 'available':
        dataToDownload = vehicles.filter(v => !v.deleted && v.status === 'available');
        fileName = 'Available_Vehicles';
        break;
      case 'in_use':
        dataToDownload = vehicles.filter(v => !v.deleted && v.status === 'in_use');
        fileName = 'InUse_Vehicles';
        break;
      case 'maintenance':
        dataToDownload = vehicles.filter(v => !v.deleted && v.status === 'maintenance');
        fileName = 'Maintenance_Vehicles';
        break;
      case 'forRegistration':
        dataToDownload = vehicles.filter(v => !v.deleted && v.status === 'forRegistration');
        fileName = 'ForRegistration_Vehicles';
        break;
      default:
        dataToDownload = vehicles.filter(v => !v.deleted);
        fileName = 'Vehicles';
    }
    
    const columns = ['Registration Number', 'Brand', 'Model', 'Year', 'Type', 'Capacity', 'Fuel Type', 
                    'Current Mileage', 'Driver', 'Status', 'Registration Expiry'];
    
    // Create CSV content
    let csvContent = columns.join(',') + '\n';
    
    dataToDownload.forEach(item => {
      const row = [
        item.regisNumber || '',
        item.brand || '',
        item.model || '',
        item.year || '',
        item.type || '',
        item.capacity || '',
        item.fuelType || '',
        item.currentMileage || '',
        item.driver || 'Not Assigned',
        item.status || '',
        item.regisExprationDate ? new Date(item.regisExprationDate).toLocaleDateString() : 'N/A'
      ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes in CSV
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Log activity
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/vehicles',
      action: 'Download Data',
      description: `Downloaded ${fileName} data (${dataToDownload.length} records)`
    });
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

  // Function to toggle card expansion
  const toggleCard = (vehicleId) => {
    if (expandedCard === vehicleId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(vehicleId);
    }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FontAwesomeIcon icon={faCar} className="me-3 text-primary" />
          Vehicle Fleet Management
        </h1>
        <CButton color="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Vehicle
        </CButton>
      </div>
      
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <CSpinner color="primary" />
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
          <CCard className="shadow mb-4">
            <CCardHeader className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  <FontAwesomeIcon icon={faCar} className="me-2 text-primary" />
                  Total Vehicles: {vehicles.filter(v => !v.deleted).length}
                </span>
                <div className="d-flex gap-2">
                  {/* Dropdown for secure downloads */}
                  <CDropdown>
                    <CDropdownToggle color="success" disabled={isDownloading}>
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Secure Download
                      {isDownloading && <CSpinner size="sm" className="ms-2" />}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => handleDownloadSecureZip('all')}>All Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownloadSecureZip('available')}>Available Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownloadSecureZip('in_use')}>In-Use Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownloadSecureZip('maintenance')}>Maintenance Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownloadSecureZip('forRegistration')}>For Registration Vehicles</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                  
                  {/* Dropdown for regular downloads */}
                  <CDropdown>
                    <CDropdownToggle color="light">
                      <FontAwesomeIcon icon={faFileExcel} className="me-2 text-success" />
                      Export CSV
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => handleDownload('all')}>All Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownload('available')}>Available Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownload('in_use')}>In-Use Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownload('maintenance')}>Maintenance Vehicles</CDropdownItem>
                      <CDropdownItem onClick={() => handleDownload('forRegistration')}>For Registration Vehicles</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                  
                  <CButton color="light" size="sm">
                    <FontAwesomeIcon icon={faPrint} className="me-2 text-primary" />
                    Print List
                  </CButton>
                </div>
              </div>
            </CCardHeader>
          </CCard>

          <CRow>
            {vehicles.filter(vehicle => !vehicle.deleted).map((vehicle) => (
              <CCol key={vehicle._id} sm={12} className="mb-4">
                <CCard 
                  className="shadow-sm border-top-0 border-left-0 border-right-0 border-bottom border-primary" 
                  style={{ cursor: 'pointer', borderWidth: '3px' }}
                >
                  <div className="d-flex flex-row">
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ width: '120px', minHeight: '100%' }}>
                      <FontAwesomeIcon icon={faCar} size="3x" className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <CCardHeader className="d-flex justify-content-between align-items-center bg-white border-0">
                        <div>
                          <h5 className="mb-0">
                            <FontAwesomeIcon icon={faClipboard} className="me-2 text-primary" />
                            {vehicle.regisNumber || 'No Registration'}
                          </h5>
                        </div>
                        <div className="d-flex align-items-center">
                          {renderStatusBadge(vehicle.status || 'unknown')}
                          <CButton 
                            color="link" 
                            className="p-0 ms-3"
                            onClick={() => toggleCard(vehicle._id)}
                          >
                            <FontAwesomeIcon 
                              icon={expandedCard === vehicle._id ? faChevronUp : faChevronDown} 
                              size="lg"
                            />
                          </CButton>
                        </div>
                      </CCardHeader>
                      <CCardBody className="py-2">
                        <div className="d-flex justify-content-between">
                          <div className="me-3">
                            <div className="text-muted small mb-1">Driver</div>
                            <div>
                              <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
                              <strong>{vehicle.driver || 'Not Assigned'}</strong>
                            </div>
                          </div>
                          
                          <div className="me-3">
                            <div className="text-muted small mb-1">Registration Expiry</div>
                            <div>
                              <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                              <strong>{formatDate(vehicle.regisExprationDate)}</strong>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted small mb-1">Brand & Model</div>
                            <div>
                              <FontAwesomeIcon icon={faTag} className="me-2 text-secondary" />
                              <strong>{(vehicle.brand || '') + ' ' + (vehicle.model || '')}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <CCollapse visible={expandedCard === vehicle._id}>
                          <hr className="my-3" />
                          
                          <div className="row">
                            {allFields.filter(field => 
                              !['regisNumber', 'driver', 'regisExprationDate', 'status', 'brand', 'model'].includes(field.key)
                            ).map(field => (
                              <div key={field.key} className="col-md-4 mb-3">
                                <div className="text-muted small mb-1">{field.label}</div>
                                <div>
                                  {field.icon && <FontAwesomeIcon icon={field.icon} className="me-2 text-primary" />}
                                  <strong>{vehicle[field.key] || 'N/A'}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CCollapse>
                      </CCardBody>
                      {expandedCard === vehicle._id && (
                        <CCardFooter className="bg-white d-flex justify-content-end gap-2 py-2">
                          <CButton color="info" size="sm">
                            <FontAwesomeIcon icon={faEye} className="me-1" /> View
                          </CButton>
                          <CButton color="success" size="sm">
                            <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                          </CButton>
                          <CButton color="danger" size="sm">
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
      <CModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Password Protected File</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Your file <strong>{downloadFileName}</strong> has been downloaded successfully.</p>
          <p>Use the following password to unlock the ZIP file:</p>
          <CAlert color="info" className="d-flex align-items-center">
            <FontAwesomeIcon icon={faLock} className="me-3 fs-4" />
            <div className="font-monospace fw-bold">{downloadPassword}</div>
          </CAlert>
          <p className="text-muted small">This password is unique to your account. Please keep it secure.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPasswordModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
  
export default VehicleDataPage;