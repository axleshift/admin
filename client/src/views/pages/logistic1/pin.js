import React, { useState } from 'react';
import { useGetLogisticsQuery, useUpdateLogisticsLocationMutation } from '../../../state/api'; // Adjust the import path based on your project structure

const Pin = () => {
  // Fetch logistics data
  const { data: logistics, error, isLoading } = useGetLogisticsQuery();
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');

  // Use the update logistics location mutation
  const [updateLogisticsLocation, { isLoading: isUpdating }] = useUpdateLogisticsLocationMutation();

  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching logistics data.</div>;

  // Handle change event for the dropdown
  const handleTrackingNumberChange = (event) => {
    const selectedTrackingNumber = event.target.value;
    const logisticsItem = logistics.find(item => item.trackingNumber === selectedTrackingNumber);
    setSelectedLogistics(logisticsItem || null); // Set the selected logistics item or null if not found

    if (logisticsItem) {
      setCurrentLocation(logisticsItem.currentLocation || 'Location not available');
    } else {
      setCurrentLocation(''); // Clear the location if nothing is selected
    }
  };

  // Handle updating the current location
  const handleLocationChange = (event) => {
    setCurrentLocation(event.target.value);
  };

  const handleUpdateLocation = async () => {
    if (selectedLogistics) {
      try {
        await updateLogisticsLocation({
          id: selectedLogistics._id, // Using the ID of the selected logistics
          currentLocation: currentLocation, // Sending the new location
        }).unwrap(); // Using unwrap to handle the result
        
        console.log(`Updated Location for Tracking Number ${selectedLogistics.trackingNumber}: ${currentLocation}`);
        
        // Optionally, you may want to refetch the logistics data here
        // This could be done by invalidating the query if using RTK Query

        // Clear form after successful update
        setSelectedLogistics(null);
        setCurrentLocation('');
      } catch (error) {
        console.error('Failed to update location:', error);
        alert('Failed to update location. Please try again.'); // Notify the user
      }
    }
  };

  return (
    <div>
      <h1>Select Tracking Number</h1>
      {logistics && logistics.length > 0 ? (
        <select onChange={handleTrackingNumberChange} defaultValue="">
          <option value="">Select a tracking number</option>
          {logistics.map((item) => (
            <option key={item._id} value={item.trackingNumber}>
              {item.trackingNumber}
            </option>
          ))}
        </select>
      ) : (
        <p>No logistics data available.</p>
      )}

      {selectedLogistics && (
        <div>
          <h2>Selected Tracking Number: {selectedLogistics.trackingNumber}</h2>
          <p>Employee ID: {selectedLogistics.employeeId}</p> {/* Display the employee ID */}
          
          <label htmlFor="currentLocation">Current Location:</label>
          <input 
            id="currentLocation" 
            type="text" 
            value={currentLocation} 
            onChange={handleLocationChange} 
            disabled={isUpdating} // Disable input while updating
          />
          <button onClick={handleUpdateLocation} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Pin;
