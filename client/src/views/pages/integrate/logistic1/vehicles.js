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
  CCardFooter
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
  faTag
} from '@fortawesome/free-solid-svg-icons';

const VehicleDataPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

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
                  <CButton color="light" size="sm">
                    <FontAwesomeIcon icon={faFileExcel} className="me-2 text-success" />
                    Export Excel
                  </CButton>
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
    </div>
  );
};

export default VehicleDataPage;