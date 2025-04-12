import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
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
  CAlert
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, 
  faWarehouse, 
  faCheck, 
  faExclamationTriangle, 
  faCalendar,
  faSearch,
  faSync
} from '@fortawesome/free-solid-svg-icons';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError('Failed to fetch inventory. Please try again later.');
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