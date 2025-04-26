import React, { useState, useEffect } from 'react';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { 
  CContainer, 
  CRow, 
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CAlert,
  CProgress,
  CProgressBar
} from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VehicleDataPage from '../pages/integrate/logistic1/component/vehicletable';
import { 
  faCar, 
  faBoxes,
  faUsers,
  faTachometerAlt,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import logActivity from '../../utils/activityLogger';

const LogisticDash = () => {
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    available: 0,
    maintenance: 0,
    forRegistration: 0
  });
  
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryError, setInventoryError] = useState(null);
  const [userData, setUsers] = useState([]);
  
  // User information from localStorage
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username');

  // Log activity when component mounts
  useEffect(() => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: 'Logistic Dashboard',
      action: 'Navigate',
      description: `${userName} Navigate to Logistic Dashboard`
    }).catch(console.warn);
  }, [userName, userRole, userDepartment]);
  
  // Fetch vehicles data
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/logistics/vehicle');
        
        if (response.data.success && response.data.data.success) {
          const vehicles = response.data.data.data;
          // Filter out deleted vehicles
          const activeVehicles = vehicles.filter(v => !v.deleted);
          
          // Calculate statistics
          const stats = {
            total: activeVehicles.length,
            available: activeVehicles.filter(v => v.status === 'available').length,
            maintenance: activeVehicles.filter(v => v.status === 'maintenance').length || 0,
            forRegistration: activeVehicles.filter(v => v.status === 'for registration').length || 0
          };
          
          setVehicleStats(stats);
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

    const fetchLogisticsDepartmentUsers = async () => {
      try {
        const response = await axiosInstance.get('/hr/worker');
        
        // Filter for Logistics department users only
        const logisticsUsers = response.data.filter(user => 
          user.department === 'Logistics' 
        );
        
        setUsers(logisticsUsers);
      } catch (err) {
        setError(err.message || 'Failed to fetch Logistics department users');
        console.error('Error fetching Logistics users:', err);
      }
    };

    // Call both fetch functions
    fetchVehicles();
    fetchLogisticsDepartmentUsers();
  }, []);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryCount = async () => {
      try {
        setInventoryLoading(true);
        const response = await axiosInstance.get('/logistics/inventory');
        
        if (response.data && Array.isArray(response.data)) {
          // Set total inventory count
          setInventoryCount(response.data.length);
        } else {
          setInventoryError('Failed to fetch inventory data');
        }
      } catch (err) {
        setInventoryError(err.message || 'An error occurred while fetching inventory data');
        console.error('Error fetching inventory:', err);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventoryCount();
  }, []);

  // Calculate vehicle availability percentage
  const vehicleAvailabilityPercentage = vehicleStats.total > 0 
    ? Math.round((vehicleStats.available / vehicleStats.total) * 100) 
    : 0;

  return (
    <CContainer fluid className="p-4">
      {/* Header */}
      <CRow className="mb-4">
        <CCol>
          <CCard className="border-0 shadow-sm">
            <CCardBody>
              <CustomHeader 
                title="Logistics Dashboard" 
                subtitle={`Welcome back, ${userName || 'User'}! Here's your logistics overview`} 
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Error Alerts */}
      {error && (
        <CRow className="mb-4">
          <CCol>
            <CAlert color="danger" dismissible>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </CAlert>
          </CCol>
        </CRow>
      )}

      {/* Main Content */}
      <CRow>
        {/* Stat Boxes Column */}
        <CCol md={5} lg={4}>
          <CRow className="g-4">
            {/* Employees Stat Box */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm h-100">
                <CCardBody className="d-flex align-items-center">
                  <div className="text-primary bg-light rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faUsers} size="2x" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Logistics Personnel</h6>
                    <h3 className="mb-0">
                      {loading ? <CSpinner size="sm" /> : userData.length}
                    </h3>
                    <small className="text-muted">Total employees in department</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Vehicles Stat Box */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm h-100">
                <CCardBody className="d-flex align-items-center">
                  <div className="text-info bg-light rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faCar} size="2x" />
                  </div>
                  <div className="w-100">
                    <h6 className="text-muted mb-1">Fleet Status</h6>
                    <h3 className="mb-0">
                      {loading ? <CSpinner size="sm" /> : vehicleStats.total}
                    </h3>
                    <div className="mt-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Vehicle Availability</small>
                        <small className="text-success">{vehicleAvailabilityPercentage}%</small>
                      </div>
                      <CProgress height={5} className="mb-3">
                        <CProgressBar 
                          color={vehicleAvailabilityPercentage > 70 ? "success" : vehicleAvailabilityPercentage > 30 ? "warning" : "danger"} 
                          value={vehicleAvailabilityPercentage} 
                        />
                      </CProgress>
                      <div className="d-flex justify-content-between">
                        <small>
                          <FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />
                          {loading ? <CSpinner size="sm" /> : vehicleStats.available} Available
                        </small>
                        <small>
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-1" />
                          {loading ? <CSpinner size="sm" /> : vehicleStats.maintenance || 0} In Maintenance
                        </small>
                      </div>
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Inventory Stat Box */}
            <CCol xs={12}>
              <CCard className="border-0 shadow-sm h-100">
                <CCardBody className="d-flex align-items-center">
                  <div className="text-success bg-light rounded-circle p-3 me-3">
                    <FontAwesomeIcon icon={faBoxes} size="2x" />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Inventory Items</h6>
                    <h3 className="mb-0">
                      {inventoryLoading ? <CSpinner size="sm" /> : inventoryCount}
                    </h3>
                    <small className="text-muted">Total items in stock</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>

        {/* Vehicle Table Column */}
        <CCol md={7} lg={8}>
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-transparent border-bottom-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faTachometerAlt} className="me-2 text-primary" />
                  Vehicle Management
                </h5>
              </div>
            </CCardHeader>
            <CCardBody>
              <VehicleDataPage />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default LogisticDash;