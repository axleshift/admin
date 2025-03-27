import React, { useState, useEffect } from 'react';
import {
  CSpinner,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CContainer,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CHeader,
  CAlert,
  CPagination,
  CPaginationItem,
  CButton,
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCircle } from '@fortawesome/free-solid-svg-icons';

const TableVehicle = ({ vehicles, loading, onDeleteVehicle, onUpdateVehicle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  useEffect(() => {
    const handleSearch = () => {
      setCurrentPage(1);
      if (searchQuery === '') {
        setFilteredVehicles(vehicles);
      } else {
        const filteredVehicles = vehicles.filter((vehicle) => {
          return (
            vehicle.regisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.year.toString().includes(searchQuery) ||
            vehicle.status.toLowerCase().includes(searchQuery.toLowerCase())
          );
        });
        setFilteredVehicles(filteredVehicles);
      }
    };
    handleSearch();
  }, [searchQuery, vehicles]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'in_use':
        return 'red';
      case 'maintenance':
        return 'orange';
      default:
        return 'black';
    }
  };

  if (vehicles.length === 0) {
    return (
      <CAlert color="danger" className="justfy-content-center">
        No vehicles found
      </CAlert>
    );
  }

  return (
    <>
      <CContainer className="mt-3">
        <CInputGroup className="w-50 mb-3 ">
          <CFormInput
            type="text"
            placeholder="Search Vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </CInputGroupText>
        </CInputGroup>
      </CContainer>

      <CAccordion>
        {currentItems.map((vehicle) => (
          <CAccordionItem key={vehicle.id}>
            <CAccordionHeader>
              <p className="w-100 m-1">
                Vehicle: <strong>{vehicle.brand} {vehicle.model}</strong>
                <FontAwesomeIcon
                  icon={faCircle}
                  color={getStatusColor(vehicle.status)}
                  className="m-2 float-end"
                />
                <small className="m-2 float-end">{vehicle.status}</small>
              </p>
            </CAccordionHeader>
            <CAccordionBody>
              <CHeader>Registration Number: {vehicle.regisNumber}</CHeader>
              <CHeader>Year: {vehicle.year}</CHeader>
              <CContainer className="d-flex justify-content-end mt-3">
                <CButton
                  color="info"
                  size="sm"
                  onClick={() => onUpdateVehicle(vehicle)}
                >
                  Edit
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => onDeleteVehicle(vehicle.id)}
                  className="ms-2"
                >
                  Delete
                </CButton>
              </CContainer>
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>

      {filteredVehicles.length > 0 && (
        <CContainer className="d-flex justify-content-between align-items-center">
          <CContainer>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVehicles.length)} of{' '}
            {filteredVehicles.length} entries
          </CContainer>

          <CPagination>
            <CPaginationItem
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </CPaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <CPaginationItem
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </CPaginationItem>
            ))}
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </CPaginationItem>
          </CPagination>
        </CContainer>
      )}
    </>
  );
};

export default TableVehicle;
