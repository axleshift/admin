import React, { useState, useEffect } from 'react';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol } from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faBoxes,
  faUsers 
} from '@fortawesome/free-solid-svg-icons';
import logActivity from '../../utils/activityLogger'
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
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
 const userDepartment = localStorage.getItem('department');
  const userUsername = localStorage.getItem('username');
  logActivity({
    name: userName,
    role: userRole,
    department: userDepartment,
    route: 'Logistic Dashboard',
    action: 'Navigate',
    description: `${userName} Navigate to Logistic Dashboard`
  }).catch(console.warn);
  
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

  // Simple useEffect for inventory count
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

  return (
    <CContainer fluid className="p-3">
      <CRow>
        <CCol>
          <CustomHeader title="Logistic Dashboard" subtitle="Welcome to the Logistic Dashboard" />
        </CCol>
      </CRow>
      <CRow className="my-3 g-3">
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Logistics Department Employees"
            value={userData.length}
            icon={<FontAwesomeIcon icon={faUsers} style={{ fontSize: '20px', color: '#0d6efd' }} />}
            description="Total Logistics personnel"
            loading={loading}
          />
        </CCol>

        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Total Vehicles"
            value={loading ? '...' : vehicleStats.total}
            icon={<FontAwesomeIcon icon={faCar} style={{ fontSize: '20px', color: '#0d6efd' }} />}
            description="Total Vehicles in the fleet"
          />
        </CCol>
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Total Inventory Items"
            value={inventoryLoading ? '...' : inventoryCount}
            icon={<FontAwesomeIcon icon={faBoxes} style={{ fontSize: '20px', color: '#20c997' }} />}
            description="Total items in the inventory"
          />
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default LogisticDash;