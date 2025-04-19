import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from '../../../../utils/activityLogger';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CSpinner,
  CBadge,
  CAlert,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, 
  faWarehouse, 
  faCheck, 
  faExclamationTriangle, 
  faCalendar,
  faSearch,
  faSync,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name'); 
  
  // Toast state and ref
  const [toast, setToast] = useState(null);
  const toaster = React.useRef();
  
  // Check if system is in dark mode
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Enhanced toast function with DARKER styling for better visibility
  const showToast = (type, title, message) => {
    // Define toast styling based on type with darker colors
    const toastStyles = {
      success: {
        icon: faCheckCircle,
        bgColor: 'bg-success',
        borderColor: 'border-success',
        iconColor: 'text-white',
        textColor: 'text-white'
      },
      danger: {
        icon: faTimesCircle,
        bgColor: 'bg-danger',
        borderColor: 'border-danger',
        iconColor: 'text-white',
        textColor: 'text-white'
      },
      warning: {
        icon: faExclamationTriangle,
        bgColor: 'bg-warning',
        borderColor: 'border-warning',
        iconColor: 'text-dark',
        textColor: 'text-dark'
      },
      info: {
        icon: faInfoCircle,
        bgColor: 'bg-info',
        borderColor: 'border-info',
        iconColor: 'text-white',
        textColor: 'text-white'
      }
    };
    
    const style = toastStyles[type] || toastStyles.info;
    
    setToast(
      <CToast 
        autohide={true} 
        delay={5000}
        animation={true}
        className={`${style.bgColor} border ${style.borderColor} shadow`}
      >
        <CToastHeader 
          closeButton
          className={`border-0 ${style.bgColor} ${style.textColor}`}
        >
          <div className="d-flex align-items-center">
            <FontAwesomeIcon 
              icon={style.icon} 
              className={`me-2 fs-5 ${style.iconColor}`}
            />
            <strong className="me-auto">{title}</strong>
          </div>
        </CToastHeader>
        <CToastBody className={`${style.textColor} py-3 fw-semibold`}>
          {message}
        </CToastBody>
      </CToast>
    );
  };
  
  // Listen for changes in color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // This will force re-render when color scheme changes
      setToast(null);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // Function to fetch inventory directly using axiosInstance
  const getAllInventory = async () => {
    try {
      const response = await axiosInstance.get('logistics/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'In Stock': { color: 'success', icon: faCheck },
      'Low Stock': { color: 'warning', icon: faExclamationTriangle },
      'Out of Stock': { color: 'danger', icon: faExclamationTriangle },
      'default': { color: 'info', icon: faBoxOpen }
    };
    
    const statusConfig = statusMap[status] || statusMap.default;
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/inventory',
      action: 'Page Visit',
      description: `${userName} visit the Inventory page`
    }).catch(console.warn);
    return (
      <CBadge color={statusConfig.color} className="ms-2 px-2 py-1">
        <FontAwesomeIcon icon={statusConfig.icon} className="me-1" /> {status}
      </CBadge>
    );
  };

  const refreshInventory = async () => {
    setLoading(true);
    try {
      const data = await getAllInventory();
      setInventory(data);
      setError(null);
      // Updated toast message to show the actual count of retrieved items
      showToast(
        'success', 
        'Inventory Updated', 
        `Successfully retrieved ${data.length} inventory item(s).`
      );
    } catch (err) {
      setError('Failed to fetch inventory. Please try again later.');
      showToast(
        'danger', 
        'Update Failed', 
        'Could not retrieve inventory data. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  return (
    <CRow>
      <CCol xs={12}>
        {/* Toaster container with improved positioning */}
        <CToaster ref={toaster} push={toast} placement="top-end" className="p-3" />
        
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faWarehouse} className="me-2" />
              <strong>Inventory Management</strong>
            </div>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={refreshInventory}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} className={loading ? 'fa-spin me-1' : 'me-1'} />
              Refresh
            </button>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {error}
              </CAlert>
            )}
            
            {loading ? (
              <div className="text-center p-5">
                <CSpinner color="primary" />
                <div className="mt-3">Loading inventory data...</div>
              </div>
            ) : (
              <>
                {inventory.length === 0 ? (
                  <CAlert color="info">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    No inventory items found
                  </CAlert>
                ) : (
                  <CTable hover responsive striped className="border">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faBoxOpen} className="me-2" />SKU</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Quantity</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Stock Level</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faCalendar} className="me-2" />Created Date</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {inventory.map((item) => (
                        <CTableRow key={item._id}>
                          <CTableDataCell>{item.sku}</CTableDataCell>
                          <CTableDataCell>{item.quantity}</CTableDataCell>
                          <CTableDataCell>{item.stock_level}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(item.status)}</CTableDataCell>
                          <CTableDataCell>{new Date(item.createdAt).toLocaleDateString()}</CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default InventoryList;