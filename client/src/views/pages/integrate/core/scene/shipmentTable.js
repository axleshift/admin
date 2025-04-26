import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CBadge,
  CInputGroup,
  CFormInput,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShippingFast, 
  faCheckCircle, 
  faTimesCircle, 
  faSearch, 
  faFilter,
  faSyncAlt,
  faBoxOpen,
  faGlobe,
  faTag,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../../../utils/axiosInstance';

const FreightTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const itemsPerPage = 10;
  
  const toaster = React.useRef();
  const [toast, setToast] = useState(null);

  // Status color mapping
  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'in transit':
        return 'primary';
      case 'processing':
        return 'info';
      case 'delayed':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Type icon mapping
  const getTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'air':
        return faShippingFast;
      case 'sea':
        return faShippingFast;
      case 'land':
        return faShippingFast;
      case 'express':
        return faShippingFast;
      default:
        return faBoxOpen;
    }
  };

  useEffect(() => {
    fetchFreightData();
  }, [refresh]);

  useEffect(() => {
    // Filter data based on search term
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(shipment => 
        Object.values(shipment).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, data]);

  const fetchFreightData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/core/fetch-core');
      const fetchedData = response.data?.data || [];
      setData(fetchedData);
      setFilteredData(fetchedData);
      setLoading(false);
      setToast(
        <CToast autohide={true} delay={3000}>
          <CToastHeader closeButton>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
            <strong className="me-auto text-success">Data Loaded</strong>
          </CToastHeader>
          <CToastBody>Successfully loaded {fetchedData.length} shipments</CToastBody>
        </CToast>
      );
    } catch (err) {
      setError(err.message || 'Failed to fetch shipment data');
      setLoading(false);
      setToast(
        <CToast autohide={true} delay={5000}>
          <CToastHeader closeButton>
            <FontAwesomeIcon icon={faTimesCircle} className="me-2 text-danger" />
            <strong className="me-auto text-danger">Error Loading Data</strong>
          </CToastHeader>
          <CToastBody>{err.message || 'Failed to fetch shipment data'}</CToastBody>
        </CToast>
      );
    }
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard className="shadow-sm border-0">
          <CCardBody className="text-center p-5">
            <CSpinner color="primary" />
            <p className="mt-3 text-muted">Loading shipment data...</p>
          </CCardBody>
        </CCard>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard className="shadow-sm border-0">
          <CCardBody className="text-center p-5">
            <FontAwesomeIcon icon={faTimesCircle} size="3x" className="mb-3 text-danger" />
            <h5 className="text-danger">Error Loading Data</h5>
            <p className="text-muted">{error}</p>
            <CButton color="primary" variant="outline" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
              Try Again
            </CButton>
          </CCardBody>
        </CCard>
      </>
    );
  }

  if (filteredData.length === 0) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-transparent d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faShippingFast} className="me-2 text-primary" />
              <strong>Shipment List</strong>
            </div>
            <CInputGroup size="sm" className="w-50">
              <CFormInput
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CButton color="primary" variant="outline">
                <FontAwesomeIcon icon={faSearch} />
              </CButton>
              <CButton color="primary" onClick={handleRefresh}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </CButton>
            </CInputGroup>
          </CCardHeader>
          <CCardBody className="text-center p-5">
            <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 text-muted" />
            <h5>No Shipments Found</h5>
            <p className="text-muted">
              {searchTerm ? "No results match your search criteria." : "There are no shipments to display."}
            </p>
            {searchTerm && (
              <CButton color="primary" variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </CButton>
            )}
          </CCardBody>
        </CCard>
      </>
    );
  }

  return (
    <>
      <CToaster ref={toaster} push={toast} placement="top-end" />
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-transparent d-flex justify-content-between align-items-center">
          <div>
            <FontAwesomeIcon icon={faShippingFast} className="me-2 text-primary" />
            <strong>Shipment List</strong>
            <CBadge color="primary" className="ms-2">{filteredData.length}</CBadge>
          </div>
          <CInputGroup size="sm" className="w-50">
            <CFormInput
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CButton color="primary" variant="outline">
              <FontAwesomeIcon icon={faSearch} />
            </CButton>
            <CDropdown variant="btn-group">
              <CDropdownToggle color="primary" variant="outline">
                <FontAwesomeIcon icon={faFilter} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setSearchTerm('')}>All</CDropdownItem>
                <CDropdownItem onClick={() => setSearchTerm('delivered')}>Delivered</CDropdownItem>
                <CDropdownItem onClick={() => setSearchTerm('in transit')}>In Transit</CDropdownItem>
                <CDropdownItem onClick={() => setSearchTerm('processing')}>Processing</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <CButton color="primary" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} />
            </CButton>
          </CInputGroup>
        </CCardHeader>
        <CCardBody className="p-0">
          <CTable hover responsive className="mb-0 border-0">
            <CTableHead className="bg-light">
              <CTableRow>
                <CTableHeaderCell className="text-center">
                  <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
                  Tracking Number
                </CTableHeaderCell>
                <CTableHeaderCell>
                  <FontAwesomeIcon icon={faGlobe} className="me-2 text-primary" />
                  Country
                </CTableHeaderCell>
                <CTableHeaderCell>
                  <FontAwesomeIcon icon={faTag} className="me-2 text-primary" />
                  Type
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentData.map((shipment) => (
                <CTableRow key={shipment._id} className="align-middle">
                  <CTableDataCell className="text-center fw-bold">{shipment.tracking_number || 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    {shipment.country || 'N/A'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <FontAwesomeIcon 
                      icon={getTypeIcon(shipment.type)} 
                      className="me-2 text-primary" 
                    />
                    {shipment.type || 'N/A'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CBadge 
                      color={getStatusBadgeColor(shipment.status)}
                      shape="rounded-pill"
                      className="px-3 py-2"
                    >
                      {shipment.status || 'Unknown'}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
        {totalPages > 1 && (
          <CCardFooter className="bg-transparent d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <CPagination aria-label="Page navigation">
              <CPaginationItem 
                aria-label="Previous" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &laquo;
              </CPaginationItem>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Show pages around current page
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                }
                
                return (
                  <CPaginationItem 
                    key={pageToShow} 
                    active={pageToShow === currentPage}
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow}
                  </CPaginationItem>
                );
              })}
              
              <CPaginationItem 
                aria-label="Next" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &raquo;
              </CPaginationItem>
            </CPagination>
          </CCardFooter>
        )}
      </CCard>
    </>
  );
};

export default FreightTable;