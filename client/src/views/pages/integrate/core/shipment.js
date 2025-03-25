import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from '../../../../utils/activityLogger';

const FreightList = () => {
  const [freights, setFreights] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user context from session storage
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userName = sessionStorage.getItem('name');

  // Log page visit on component mount
  useEffect(() => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/freights',
      action: 'Page Visit',
      description: 'User viewed the freights list page'
    });
  }, [userName, userRole, userDepartment]);

  // Sync Freight Data
  const syncFreightData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/core/syncFreightData');
      console.log('Sync response:', response.data);
      // Fetch freights after sync
      await fetchFreights();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while syncing freights');
      console.error('Error syncing freights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch freights
  const fetchFreights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/core/freight', {
        params: { page }
      });
      setFreights(response.data.freights);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching freights');
      console.error('Error fetching freights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch and sync
  useEffect(() => {
    // First, sync data
    syncFreightData();
  }, []);

  // Fetch freights when page changes
  useEffect(() => {
    fetchFreights();
  }, [page]);

  // Handle individual freight item click for logging
  const handleFreightClick = (freightId) => {
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: `/freights/${freightId}`,
      action: 'View Freight',
      description: `User viewed details for freight ID: ${freightId}`
    });
    // You could add navigation logic here if needed
  };

  // Handle pagination
  const handlePreviousPage = () => setPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage(prev => prev + 1);

  // Render loading state
  if (isLoading) return <p>Loading freights...</p>;

  // Render error state
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="freight-list-container">
      <h2>Freight List</h2>
      
      <div className="sync-section">
        <button 
          onClick={syncFreightData} 
          disabled={isLoading}
        >
          {isLoading ? 'Syncing...' : 'Sync Freight Data'}
        </button>
      </div>
      
      <table className="freight-table">
        <thead>
          <tr>
            <th>Tracking Number</th>
            <th>Country</th>
            <th>Status</th>
            <th>Total Weight</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {freights.length > 0 ? (
            freights.map(freight => (
              <tr 
                key={freight._id} 
                onClick={() => handleFreightClick(freight._id)}
                className="freight-row"
              >
                <td>{freight.tracking_number}</td>
                <td>{freight.country}</td>
                <td>{freight.status}</td>
                <td>{freight.total_weight} kg</td>
                <td>{freight.amount.currency} {freight.amount.value}</td>
                <td>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleFreightClick(freight._id);
                  }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No freights available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          onClick={handlePreviousPage}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={handleNextPage}
          disabled={page === totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FreightList;