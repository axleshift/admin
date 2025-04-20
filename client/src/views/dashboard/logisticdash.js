import React, { useState, useEffect } from 'react';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol } from '@coreui/react';
import AnnouncementList from '../pages/Announcement/AnnouncementList';
import axiosInstance from '../../utils/axiosInstance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTruck, faExclamationTriangle, faTools } from '@fortawesome/free-solid-svg-icons';

const LogisticDash = () => {
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    available: 0,
    maintenance: 0,
    forRegistration: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    fetchVehicles();
  }, []);

  return (
    <CContainer fluid className="p-3">
      <CRow>
        <CCol>
          <CustomHeader title="Logistic Dashboard" subtitle="Welcome to the Logistic Dashboard" />
          <AnnouncementList />
        </CCol>
      </CRow>
      <CRow className="my-3 g-3">
        <CCol xs={12} md={6} lg={3}>
          <StatBox
            title="Total Vehicles"
            value={loading ? '...' : vehicleStats.total}
    
            icon={<FontAwesomeIcon icon={faCar} style={{ fontSize: '20px', color: '#0d6efd' }} />}
          />
        </CCol>
        
      </CRow>
    </CContainer>
  );
};

export default LogisticDash;