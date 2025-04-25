import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import logActivity from '../../../../utils/activityLogger';
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
  const [showToastNotification, setShowToastNotification] = useState(false);
  
  logActivity({
    name: userName,
    role: userRole,
    department: userDepartment,
    route: '/inventory',
    action: 'Page Visit',
    description: `${userName} visit the Inventory page`
  }).catch(console.warn);
  
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
    
    setToast({
      type,
      title,
      message,
      style
    });
    
    setShowToastNotification(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowToastNotification(false);
    }, 5000);
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
      'In Stock': { color: 'success', icon: faCheck, bgColor: '#28a745', textColor: 'white' },
      'Low Stock': { color: 'warning', icon: faExclamationTriangle, bgColor: '#ffc107', textColor: 'black' },
      'Out of Stock': { color: 'danger', icon: faExclamationTriangle, bgColor: '#dc3545', textColor: 'white' },
      'default': { color: 'info', icon: faBoxOpen, bgColor: '#17a2b8', textColor: 'white' }
    };
    
    const statusConfig = statusMap[status] || statusMap.default;
    
  
    return (
      <span 
        className="ms-2 px-2 py-1 rounded"
        style={{ 
          backgroundColor: statusConfig.bgColor, 
          color: statusConfig.textColor,
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontWeight: '700',
          marginLeft: '8px'
        }}
      >
        <FontAwesomeIcon icon={statusConfig.icon} style={{ marginRight: '4px' }} /> {status}
      </span>
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

  // Toast component
  const Toast = () => {
    if (!toast || !showToastNotification) return null;
    
    return (
      <div 
        className={`position-fixed top-0 end-0 p-3`} 
        style={{ zIndex: 1050 }}
      >
        <div 
          className={`toast show shadow ${toast.style.bgColor} border ${toast.style.borderColor}`}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className={`toast-header border-0 ${toast.style.bgColor} ${toast.style.textColor}`}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={toast.style.icon} 
                className={`me-2 fs-5 ${toast.style.iconColor}`}
              />
              <strong className="me-auto">{toast.title}</strong>
            </div>
            <button 
              type="button" 
              className={`btn-close ${toast.style.textColor === 'text-white' ? 'btn-close-white' : ''}`} 
              onClick={() => setShowToastNotification(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className={`toast-body ${toast.style.textColor} py-3 fw-semibold`}>
            {toast.message}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="row">
      <div className="col-12">
        {/* Toast container */}
        <Toast />
        
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
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
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-3">Loading inventory data...</div>
              </div>
            ) : (
              <>
                {inventory.length === 0 ? (
                  <div className="alert alert-info">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    No inventory items found
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped border">
                      <thead className="table-light">
                        <tr>
                          <th scope="col"><FontAwesomeIcon icon={faBoxOpen} className="me-2" />SKU</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Stock Level</th>
                          <th scope="col">Status</th>
                          <th scope="col"><FontAwesomeIcon icon={faCalendar} className="me-2" />Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => (
                          <tr key={item._id}>
                            <td>{item.sku}</td>
                            <td>{item.quantity}</td>
                            <td>{item.stock_level}</td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;