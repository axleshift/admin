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
  CAlert,
  CCollapse,
  CButton
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faCalendarAlt, 
  faDollarSign, 
  faBuilding,
  faCheck, 
  faSpinner, 
  faExclamationCircle,
  faBoxes,
  faCaretDown,
  faCaretUp,
  faExclamationTriangle,
  faSync
} from '@fortawesome/free-solid-svg-icons';

const ProcurementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleDetails, setVisibleDetails] = useState({});

  const toggleDetails = (id) => {
    setVisibleDetails(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const fetchProcurementData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/logistics/procurement');
      setData(response.data.data);
      setError(null);
    } catch (error) {
      setError('Error fetching procurement data');
      console.error('Procurement data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'warning', icon: faSpinner },
      'Approved': { color: 'success', icon: faCheck },
      'In Progress': { color: 'info', icon: faSpinner },
      'Completed': { color: 'success', icon: faCheck },
      'Cancelled': { color: 'danger', icon: faExclamationCircle },
      'default': { color: 'secondary', icon: faSpinner }
    };
    
    const config = statusConfig[status] || statusConfig.default;
    
    return (
      <CBadge color={config.color} className="px-2 py-1">
        <FontAwesomeIcon icon={config.icon} className="me-1" /> {status}
      </CBadge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              <strong>Procurement Management</strong>
            </div>
            <CButton 
              color="outline-primary" 
              size="sm"
              onClick={fetchProcurementData}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} className={loading ? 'fa-spin me-1' : 'me-1'} />
              Refresh
            </CButton>
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
                <div className="mt-3">Loading procurement data...</div>
              </div>
            ) : (
              <>
                {data.length === 0 ? (
                  <CAlert color="info">
                    No procurement records found
                  </CAlert>
                ) : (
                  <CTable hover responsive striped className="border">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Procurement Date</CTableHeaderCell>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faBuilding} className="me-1" /> Department</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faDollarSign} className="me-1" /> Est. Cost</CTableHeaderCell>
                        <CTableHeaderCell scope="col"><FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Delivery Date</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Products</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {data.map((procurement) => (
                        <React.Fragment key={procurement._id}>
                          <CTableRow>
                            <CTableDataCell>{procurement.title}</CTableDataCell>
                            <CTableDataCell>
                              {procurement.description.length > 50 
                                ? `${procurement.description.substring(0, 50)}...` 
                                : procurement.description}
                            </CTableDataCell>
                            <CTableDataCell>{new Date(procurement.procurementDate).toLocaleDateString()}</CTableDataCell>
                            <CTableDataCell>{procurement.department}</CTableDataCell>
                            <CTableDataCell>{getStatusBadge(procurement.status)}</CTableDataCell>
                            <CTableDataCell>{formatCurrency(procurement.estimatedCost)}</CTableDataCell>
                            <CTableDataCell>{new Date(procurement.deliveryDate).toLocaleDateString()}</CTableDataCell>
                            <CTableDataCell>
                              <CButton 
                                color="link" 
                                size="sm"
                                onClick={() => toggleDetails(procurement._id)}
                              >
                                <FontAwesomeIcon icon={faBoxes} className="me-1" />
                                {procurement.products.length} Items
                                <FontAwesomeIcon 
                                  icon={visibleDetails[procurement._id] ? faCaretUp : faCaretDown} 
                                  className="ms-1"
                                />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell colSpan="8" className="p-0">
                              <CCollapse visible={visibleDetails[procurement._id]}>
                                <CCard className="m-3 border-0">
                                  <CCardHeader>
                                    <FontAwesomeIcon icon={faBoxes} className="me-2" />
                                    Product Details
                                  </CCardHeader>
                                  <CCardBody>
                                    <CTable small borderless>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell>Name</CTableHeaderCell>
                                          <CTableHeaderCell>Quantity</CTableHeaderCell>
                                          <CTableHeaderCell>Unit</CTableHeaderCell>
                                          <CTableHeaderCell>Unit Price</CTableHeaderCell>
                                          <CTableHeaderCell>Total</CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {procurement.products.map((product) => (
                                          <CTableRow key={product._id}>
                                            <CTableDataCell>{product.name}</CTableDataCell>
                                            <CTableDataCell>{product.quantity}</CTableDataCell>
                                            <CTableDataCell>{product.unit}</CTableDataCell>
                                            <CTableDataCell>{formatCurrency(product.unitPrice)}</CTableDataCell>
                                            <CTableDataCell>
                                              {formatCurrency(product.quantity * product.unitPrice)}
                                            </CTableDataCell>
                                          </CTableRow>
                                        ))}
                                      </CTableBody>
                                    </CTable>
                                  </CCardBody>
                                </CCard>
                              </CCollapse>
                            </CTableDataCell>
                          </CTableRow>
                        </React.Fragment>
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

export default ProcurementPage;