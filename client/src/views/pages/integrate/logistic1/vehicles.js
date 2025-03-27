import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CContainer,
  CHeader,
  CButton,
  CSpinner,
} from '@coreui/react';
import TableVehicle from './component/TableDriver';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = 'https://backend-log1.axleshift.com/api/v1/vehicle/all';
  const apiKey = '0ad3f5c013c42d2d0537672a260978c71dcd5a7d508019d748f991deee3d65665a477e3523c6bbc83fd6a51a71dd5003';

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setVehicles(response.data.data || []);
      } else {
        setError('Failed to fetch vehicles.');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleUpdateVehicle = (vehicle) => {
    console.log('Edit vehicle:', vehicle);
    // Implement update functionality here
  };

  const handleDeleteVehicle = (id) => {
    console.log('Delete vehicle with ID:', id);
    // Implement delete functionality here
  };

  if (loading) {
    return (
      <div className="text-center">
        <CSpinner color="primary" size="sm" />
      </div>
    );
  }

  return (
    <>
      <CHeader className="text-center">Vehicle Management</CHeader>
      <CContainer className="m-3">
        <CButton color="primary" onClick={() => console.log('Add new vehicle')}>
          Add Vehicle
        </CButton>
      </CContainer>
      <CCard>
        <CCardBody>
          {error && <div className="text-danger text-center">{error}</div>}
          <TableVehicle
            vehicles={vehicles}
            loading={loading}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={handleUpdateVehicle}
          />
        </CCardBody>
      </CCard>
    </>
  );
};

export default VehiclesManagement;
