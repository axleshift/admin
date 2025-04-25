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
  CButton,
  CPagination,
  CPaginationItem
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

// Import or define the logActivity function if it's not imported elsewhere
const logActivity = async (activityData) => {
  try {
    await axiosInstance.post('/activity/log', activityData);
  } catch (error) {
    console.warn('Failed to log activity:', error);
  }
};

const ProcurementPage = () => {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleDetails, setVisibleDetails] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name'); 

  const toggleDetails = (id) => {
    setVisibleDetails(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const fetchProcurementData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/logistics/procurement?page=${page}&limit=10`);
      
      // Check if the response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        // Extract procurements array and pagination data
        const { procurements, pagination } = response.data.data;
        
        if (Array.isArray(procurements)) {
          setProcurements(procurements);
          setPagination(pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: procurements.length,
            hasNext: false,
            hasPrev: false
          });
          setError(null);
        } else {
          setProcurements([]);
          setError('Invalid data format: Procurements is not an array');
          console.error('Invalid procurements data:', response.data);
        }
      } else {
        setProcurements([]);
        setError('Invalid response format from server');
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      setError('Error fetching procurement data');
      console.error('Procurement data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData();
    
    // Log the activity when component mounts
    if (userName) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/procurement',
        action: 'View Procurement Page',
        description: 'User viewed the procurement management page'
      }).catch(console.warn);
    }
  }, [userName, userRole, userDepartment]);

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
              onClick={() => fetchProcurementData(pagination.currentPage)}
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
                {procurements.length === 0 ? (
                  <CAlert color="info">
                    No procurement records found
                  </CAlert>
                ) : (
                  <>
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
                        {procurements.map((procurement) => (
                          <React.Fragment key={procurement._id}>
                            <CTableRow>
                              <CTableDataCell>{procurement.title}</CTableDataCell>
                              <CTableDataCell>
                                {procurement.description && procurement.description.length > 50 
                                  ? `${procurement.description.substring(0, 50)}...` 
                                  : procurement.description || 'No description'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {procurement.procurementDate 
                                  ? new Date(procurement.procurementDate).toLocaleDateString() 
                                  : 'N/A'}
                              </CTableDataCell>
                              <CTableDataCell>{procurement.department || 'N/A'}</CTableDataCell>
                              <CTableDataCell>{getStatusBadge(procurement.status)}</CTableDataCell>
                              <CTableDataCell>
                                {procurement.estimatedCost !== undefined 
                                  ? formatCurrency(procurement.estimatedCost) 
                                  : 'N/A'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {procurement.deliveryDate 
                                  ? new Date(procurement.deliveryDate).toLocaleDateString() 
                                  : 'N/A'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {procurement.products && Array.isArray(procurement.products) ? (
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
                                ) : (
                                  'No products'
                                )}
                              </CTableDataCell>
                            </CTableRow>
                            {procurement.products && Array.isArray(procurement.products) && (
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
                                                <CTableDataCell>{product.name || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>{product.quantity || 0}</CTableDataCell>
                                                <CTableDataCell>{product.unit || 'N/A'}</CTableDataCell>
                                                <CTableDataCell>
                                                  {product.unitPrice !== undefined 
                                                    ? formatCurrency(product.unitPrice) 
                                                    : 'N/A'}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                  {(product.quantity && product.unitPrice !== undefined) 
                                                    ? formatCurrency(product.quantity * product.unitPrice)
                                                    : 'N/A'}
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
                            )}
                          </React.Fragment>
                        ))}
                      </CTableBody>
                    </CTable>
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <CPagination>
                          <CPaginationItem 
                            disabled={!pagination.hasPrev}
                            onClick={() => fetchProcurementData(pagination.currentPage - 1)}
                          >
                            Previous
                          </CPaginationItem>
                          
                          {[...Array(pagination.totalPages).keys()].map(page => (
                            <CPaginationItem 
                              key={page + 1}
                              active={page + 1 === pagination.currentPage}
                              onClick={() => fetchProcurementData(page + 1)}
                            >
                              {page + 1}
                            </CPaginationItem>
                          ))}
                          
                          <CPaginationItem 
                            disabled={!pagination.hasNext}
                            onClick={() => fetchProcurementData(pagination.currentPage + 1)}
                          >
                            Next
                          </CPaginationItem>
                        </CPagination>
                      </div>
                    )}
                  </>
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