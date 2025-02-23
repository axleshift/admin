import React, { useEffect, useState } from 'react';

import { useGetShipmentsQuery } from '../../../../state/coreApi';

const ShipmentsList = () => {
  const { data: shipments, error, isLoading } = useGetShipmentsQuery();

  if (isLoading) return <p>Loading shipments...</p>;
  if (error) return <p>Error fetching shipments: {error.message}</p>;


  return (
    <div>
      <h1>Shipments List</h1>
      <ul>
        {Array.isArray(shipments) && shipments.length > 0 ? (
          shipments.map(shipment => (
            <li key={shipment.shipmentId}>
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
