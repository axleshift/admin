import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CTable,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableHead,
  CSpinner,
} from '@coreui/react';
import { useGetLogisticsQuery } from '../../../state/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LogisticsDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { data, isLoading, error } = useGetLogisticsQuery();
  const [selectedStatus, setSelectedStatus] = useState({});

  if (isLoading) return <CSpinner color="primary" />;
  if (error) return <p>Error loading logistics data.</p>;

  // Handle status change for logistics
  const handleStatusChange = (event, id) => {
    const status = event.target.value;
    setSelectedStatus((prev) => ({ ...prev, [id]: status }));
  };

  // Function to navigate to the desired route
  const handleNavigate = () => {
    navigate('/logistic1/pin'); // Replace with your actual route
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h2>Logistics Overview</h2>
        <CButton color="primary" onClick={handleNavigate}>Send Location</CButton> {/* Button added */}
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Logistics ID</CTableHeaderCell>
              <CTableHeaderCell>Origin</CTableHeaderCell>
              <CTableHeaderCell>Destination</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Tracking Number</CTableHeaderCell>
              <CTableHeaderCell>Dispatch Date</CTableHeaderCell>
              <CTableHeaderCell>Utilization</CTableHeaderCell>
              <CTableHeaderCell>Route</CTableHeaderCell>
              <CTableHeaderCell>Estimated Arrival</CTableHeaderCell>
              <CTableHeaderCell>Delivery Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((logistics) => (
              <CTableRow key={logistics._id}>
                <CTableHeaderCell>{logistics._id}</CTableHeaderCell>
                <CTableHeaderCell>{logistics.origin}</CTableHeaderCell>
                <CTableHeaderCell>{logistics.destination}</CTableHeaderCell>
                <CTableHeaderCell>
                  <CFormSelect
                    style={{ width: '200px' }}
                    value={selectedStatus[logistics._id] || logistics.status}
                    onChange={(e) => handleStatusChange(e, logistics._id)}
                  >
                    <option value="pending">Pending</option>
                    <option value="delay">Delay</option>
                    <option value="in transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </CFormSelect>
                </CTableHeaderCell>
                <CTableHeaderCell>{logistics.trackingNumber}</CTableHeaderCell>
                <CTableHeaderCell>{logistics.dispatchDate}</CTableHeaderCell>
                <CTableHeaderCell>{logistics.loadOptimization.utilization}%</CTableHeaderCell>
                <CTableHeaderCell>{logistics.loadOptimization.route}</CTableHeaderCell>
                <CTableHeaderCell>{logistics.loadOptimization.estimatedTimeArrival}</CTableHeaderCell>
                <CTableHeaderCell>
                  {logistics.status === 'delivered'
                    ? 'Delivered'
                    : logistics.status === 'in transit'
                    ? 'In Transit'
                    : logistics.status === 'delay'
                    ? 'Delay'
                    : 'Pending'}
                </CTableHeaderCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default LogisticsDashboard;
