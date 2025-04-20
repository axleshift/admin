import React, { useState, useEffect } from 'react';
import { 
  CTable, 
  CTableBody, 
  CTableDataCell, 
  CTableHead, 
  CTableHeaderCell, 
  CTableRow,
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CSpinner,
  CPagination,
  CPaginationItem,
  CCardFooter,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShippingFast, 
  faExclamationTriangle, 
  faBoxOpen,
  faMoneyBillWave,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from '../../../../utils/activityLogger';

const FreightTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Toast state
  const [toast, setToast] = useState(null);
  const toaster = React.useRef();

  // Retrieve user information from localStorage to match the ExampleButtonPage pattern
  const userName = localStorage.getItem('name'); 
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userId = localStorage.getItem('userId');
  const userUsername = localStorage.getItem('username');
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

  // Function to add toast
  const addToast = (title, message, color) => {
    setToast(
      <CToast autohide={true} delay={5000}>
        <CToastHeader closeButton>
          <FontAwesomeIcon 
            icon={color === 'success' ? faCheckCircle : faTimesCircle} 
            className="me-2" 
          />
          <strong className={`me-auto text-${color}`}>{title}</strong>
        </CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>
    );
  };

  useEffect(() => {
    const fetchFreightData = async () => {
      try {
        setLoading(true);
        
        // Log activity for data fetch attempt
        if (userId && userName && userRole && userDepartment) {
          logActivity({
            name: userName,
            role: userRole,
            department: userDepartment,
            route: '/freight-table',
            action: 'Fetch Shipments',
            description: 'User accessed freight shipment data'
          }).catch(console.warn);
        }

        const response = await axiosInstance.get('/core/fetch-core');
        
        // Ensure we're getting the data array from the response
        const fetchedData = response.data?.data || [];
        
        setData(fetchedData);
        setLoading(false);

        // Show success toast
        addToast(
          'Data Loaded', 
          `Successfully loaded ${fetchedData.length} shipments`, 
          'success'
        );

        // Log successful data fetch
        if (userId && userName && userRole && userDepartment) {
          logActivity({
            name: userName,
            role: userRole,
            department: userDepartment,
            route: '/freight-table',
            action: 'Shipments Loaded',
            description: `Successfully loaded ${fetchedData.length} shipments`
          }).catch(console.warn);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch shipment data');
        setLoading(false);

        // Show error toast
        addToast(
          'Error Loading Data', 
          err.message || 'Failed to fetch shipment data', 
          'danger'
        );

        // Log error in data fetch
        if (userId && userName && userRole && userDepartment) {
          logActivity({
            name: userName,
            role: userRole,
            department: userDepartment,
            route: '/freight-table',
            action: 'Shipments Load Failed',
            description: `Error fetching shipments: ${err.message}`
          }).catch(console.warn);
        }
      }
    };

    fetchFreightData();
  }, [userId, userName, userRole, userDepartment]);

  // Pagination handlers
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Log page change activity
    if (userId && userName && userRole && userDepartment) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/freight-table',
        action: 'Pagination',
        description: `User navigated to page ${page} of shipments`
      }).catch(console.warn);
    }
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard>
          <CCardBody className="text-center">
            <CSpinner color="primary" />
            <p className="mt-2">Loading Shipments...</p>
          </CCardBody>
        </CCard>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard className="text-danger">
          <CCardBody className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="mb-3" />
            <p>{error}</p>
          </CCardBody>
        </CCard>
      </>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <CCard>
          <CCardBody className="text-center">
            <FontAwesomeIcon icon={faShippingFast} size="3x" className="mb-3" />
            <p>No Shipments Found</p>
          </CCardBody>
        </CCard>
      </>
    );
  }

  // Status badge color mapper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'to_pay': return 'warning';
      case 'cancelled': return 'danger';
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'processing': return 'primary';
      default: return 'secondary';
    }
  };

  // Handler for row click to log interaction
  const handleRowClick = (shipment) => {
    if (userId && userName && userRole && userDepartment) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/freight-table',
        action: 'View Shipment Details',
        description: `Viewed details for shipment ${shipment.tracking_number}`
      }).catch(console.warn);
    }
  };

  // Handler for filter or sort actions
  const handleSortByColumn = (columnName) => {
    if (userId && userName && userRole && userDepartment) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/freight-table',
        action: 'Sort Shipments',
        description: `User sorted shipments by ${columnName}`
      }).catch(console.warn);
    }
    // Actual sorting implementation would go here
  };

  // Get paginated data
  const currentData = getCurrentPageData();

  // Create pagination items
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <CPaginationItem 
        key={i} 
        active={i === currentPage} 
        onClick={() => handlePageChange(i)}
      >
        {i}
      </CPaginationItem>
    );
  }

  return (
    <>
      <CToaster ref={toaster} push={toast} placement="top-end" />
      <CCard>
        <CCardHeader>
          <FontAwesomeIcon icon={faShippingFast} className="me-2" />
          Shipment List
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSortByColumn('tracking_number')}>
                  Tracking Number
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('country')}>
                  Country
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('type')}>
                  Type
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('status')}>
                  Status
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('weight')}>
                  Weight
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('items')}>
                  Items
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSortByColumn('amount')}>
                  Amount
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentData.map((shipment) => (
                <CTableRow 
                  key={shipment._id} 
                  onClick={() => handleRowClick(shipment)}
                  style={{ cursor: 'pointer' }}
                >
                  <CTableDataCell>{shipment.tracking_number}</CTableDataCell>
                  <CTableDataCell>{shipment.country}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={shipment.type === 'business' ? 'info' : 'primary'}>
                      {shipment.type}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getStatusBadge(shipment.status)}>
                      {shipment.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <FontAwesomeIcon icon={faBoxOpen} className="me-1" />
                    {shipment.total_weight} kg
                  </CTableDataCell>
                  <CTableDataCell>{shipment.number_of_items}</CTableDataCell>
                  <CTableDataCell>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" />
                    {shipment.amount.value} {shipment.amount.currency}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
        {totalPages > 1 && (
          <CCardFooter className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} shipments
            </div>
            <CPagination aria-label="Shipment navigation">
              <CPaginationItem 
                aria-label="Previous" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <span aria-hidden="true">&laquo;</span>
              </CPaginationItem>
              {paginationItems}
              <CPaginationItem 
                aria-label="Next" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <span aria-hidden="true">&raquo;</span>
              </CPaginationItem>
            </CPagination>
          </CCardFooter>
        )}
      </CCard>
    </>
  );
};

export default FreightTable;