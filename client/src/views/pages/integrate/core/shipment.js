import React, { useEffect } from 'react';
import { useGetShipmentsQuery } from '../../../../state/coreApi';
import logActivity from '../../../../utils/ActivityLogger'; // Import the logActivity function

const ShipmentsList = () => {
  const { data: shipments, error, isLoading } = useGetShipmentsQuery();
  
  // Get user information from sessionStorage
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userName = sessionStorage.getItem('name');
  
  // Log page visit when component mounts
  useEffect(() => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/shipments',
      action: 'Page Visit',
      description: 'User viewed the shipments list page'
    });
  }, [userName, userRole, userDepartment]);

  // Handle clicking on a shipment item
  const handleShipmentClick = (shipmentId) => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: `/shipments/${shipmentId}`,
      action: 'View Shipment',
      description: `User viewed details for shipment ID: ${shipmentId}`
    });
    
    // You could add navigation logic here if needed
    // navigate(`/shipment-details/${shipmentId}`);
  };

  if (isLoading) return <p>Loading shipments...</p>;
  if (error) return <p>Error fetching shipments: {error.message}</p>;

  return (
    <div>
      <h1>Shipments List</h1>
      <ul className="shipment-list">
        {Array.isArray(shipments) && shipments.length > 0 ? (
          shipments.map(shipment => (
            <li 
              key={shipment.shipmentId}
              className="shipment-item"
              onClick={() => handleShipmentClick(shipment.shipmentId)}
            >
              <h3>{shipment.shipmentId}</h3>
              <p>Origin: {shipment.origin}</p>
              <p>Destination: {shipment.destination}</p>
              <p>Status: {shipment.status}</p>
              <p>Estimated Arrival: {new Date(shipment.estimatedArrival).toLocaleDateString()}</p>
            </li>
          ))
        ) : (
          <li>No shipments available</li>
        )}
      </ul>
    </div>
  );
};

export default ShipmentsList;