import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faCalendarAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const VehicleDataPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 5;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const activeVehicles = vehicles.filter(vehicle => !vehicle.deleted);
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = activeVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(activeVehicles.length / vehiclesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="container-fluid p-4 small">
      <h6 className="mb-4">
        <FontAwesomeIcon icon={faCar} className="me-2 text-primary" />
      </h6>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger mb-4"><strong>Error: </strong><span>{error}</span></div>}

      {!loading && !error && activeVehicles.length === 0 && (
        <div className="alert alert-warning mb-4">No vehicle data available.</div>
      )}

      {!loading && !error && activeVehicles.length > 0 && (
        <>
          <div className="row">
            {currentVehicles.map(vehicle => (
              <div key={vehicle._id} className="col-12 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <FontAwesomeIcon icon={faCar} className="me-2 text-primary" />
                      <strong>{vehicle.regisNumber || 'No Registration'}</strong>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                      <strong>{formatDate(vehicle.regisExprationDate)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Vehicle pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={prevPage} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                </li>
                {[...Array(totalPages).keys()].map(number => (
                  <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(number + 1)}>
                      {number + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={nextPage} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </li>
              </ul>
              <div className="text-center text-muted small mt-2">
                Showing {indexOfFirstVehicle + 1} to {Math.min(indexOfLastVehicle, activeVehicles.length)} of {activeVehicles.length} vehicles
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default VehicleDataPage;
