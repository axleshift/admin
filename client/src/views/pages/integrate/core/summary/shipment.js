import React, { useState, useEffect } from 'react';
import { 
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CCard, CCardHeader, CCardBody, CBadge, CSpinner, CPagination, CPaginationItem
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShippingFast, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../../../utils/axiosInstance';

const FreightTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFreightData = async () => {
      try {
        const response = await axiosInstance.get('/core/fetch-core');
        setData(response.data?.data || []);
      } catch (err) {
        setError('Failed to fetch shipments');
      } finally {
        setLoading(false);
      }
    };
    fetchFreightData();
  }, []);

  if (loading) return <CSpinner color="primary" className="d-block mx-auto my-4" />;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!data.length) return <p className="text-center">No shipments found</p>;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  return (
    <CCard>
      <CCardHeader>
        <FontAwesomeIcon icon={faShippingFast} className="me-2" /> Shipments
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Tracking</CTableHeaderCell>
              <CTableHeaderCell>Country</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {paginatedData.map(({ _id, tracking_number, country, type, status }) => (
              <CTableRow key={_id}>
                <CTableDataCell>{tracking_number}</CTableDataCell>
                <CTableDataCell>{country}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={type === 'business' ? 'info' : 'primary'}>{type}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge color={status === 'to_pay' ? 'warning' : status === 'cancelled' ? 'danger' : 'secondary'}>
                    {status}
                  </CBadge>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        {totalPages > 1 && (
          <CPagination align="center" className="mt-3">
            <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</CPaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <CPaginationItem key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </CPaginationItem>
            ))}
            <CPaginationItem disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</CPaginationItem>
          </CPagination>
        )}
      </CCardBody>
    </CCard>
  );
};

export default FreightTable;
