import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  CPagination,
  CPaginationItem,
  CCard,
  CCardHeader,
  CCardBody,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CRow,
  CCol
} from '@coreui/react';
import '../../../../../scss/invoice.scss';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faClock, 
  faEye, 
  faEdit, 
  faTrash,
  faFileInvoice,
  faUser,
  faDollarSign,
  faCalendarAlt,
  faFilter,
  faSort,
  faSearch,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Changed from 10 to 5
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get('/finance/invoices');
        console.log('Fetched invoice response:', response.data);
        
        const result = response.data;
        
        if (Array.isArray(result)) {
          setInvoices(result);
        } else if (result && Array.isArray(result.data)) {
          setInvoices(result.data);
        } else if (result && typeof result.data === 'object') {
          setInvoices([result.data]);
        } else {
          console.error('Unexpected data format:', result);
          setInvoices([]);
        }
        
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInvoices();
  }, []);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return (
          <div className="status-badge status-paid">
            <FontAwesomeIcon icon={faCheckCircle} /> Paid
          </div>
        );
      case 'unpaid':
        return (
          <div className="status-badge status-unpaid">
            <FontAwesomeIcon icon={faTimesCircle} /> Unpaid
          </div>
        );
      case 'pending':
        return (
          <div className="status-badge status-pending">
            <FontAwesomeIcon icon={faClock} /> Pending
          </div>
        );
      default:
        return (
          <div className="status-badge">
            {status || 'N/A'}
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null) return 'N/A';
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchText = searchTerm.toLowerCase();
    return (
      (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchText)) ||
      (invoice.firstName && invoice.firstName.toLowerCase().includes(searchText)) ||
      (invoice.lastName && invoice.lastName.toLowerCase().includes(searchText)) ||
      (invoice.status && invoice.status.toLowerCase().includes(searchText))
    );
  });

  // Get current invoices for pagination
  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Number of page numbers to show
    let pageNumbers = [];
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range to show maxPagesToShow - 2 pages (excluding first and last)
      if (endPage - startPage < maxPagesToShow - 3) {
        if (currentPage < totalPages / 2) {
          endPage = Math.min(startPage + maxPagesToShow - 3, totalPages - 1);
        } else {
          startPage = Math.max(2, endPage - (maxPagesToShow - 3));
        }
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add page numbers in range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Change page
  const paginate = (pageNumber) => {
    if (typeof pageNumber === 'number') {
      setCurrentPage(pageNumber);
    }
  };
  
  if (loading) return (
    <CCard className="mb-4">
      <CCardBody className="d-flex justify-content-center align-items-center p-5">
        <div className="loading-container text-center">
          <FontAwesomeIcon icon={faClock} spin size="2x" className="mb-3" />
          <p>Loading invoices...</p>
        </div>
      </CCardBody>
    </CCard>
  );
  
  if (error) return (
    <CCard className="mb-4">
      <CCardBody className="d-flex justify-content-center align-items-center p-5">
        <div className="error-container text-center">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" color="red" className="mb-3" />
          <p>{error}</p>
        </div>
      </CCardBody>
    </CCard>
  );
  
  if (!invoices || invoices.length === 0) return (
    <CCard className="mb-4">
      <CCardBody className="d-flex justify-content-center align-items-center p-5">
        <div className="empty-container text-center">
          <FontAwesomeIcon icon={faFileInvoice} size="2x" className="mb-3" />
          <p>No invoices found.</p>
        </div>
      </CCardBody>
    </CCard>
  );

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <FontAwesomeIcon icon={faFileInvoice} className="me-2" /> All Invoices
        </h4>
        <CInputGroup className="w-auto">
          <CInputGroupText>
            <FontAwesomeIcon icon={faSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: '250px' }}
          />
        </CInputGroup>
      </CCardHeader>
      
      <CCardBody>
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle">
            <thead className="bg-light">
              <tr>
                <th><FontAwesomeIcon icon={faFileInvoice} className="me-2" /> Invoice #</th>
                <th><FontAwesomeIcon icon={faUser} className="me-2" /> Client</th>
                <th><FontAwesomeIcon icon={faFilter} className="me-2" /> Status</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice, index) => (
                <tr key={invoice._id || `invoice-${index}`}>
                  <td className="invoice-number">
                    <FontAwesomeIcon icon={faFileInvoice} className="me-2 text-secondary" />
                    {invoice.invoiceNumber || invoice._id || 'N/A'}
                  </td>
                  <td>
                    <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                    {invoice.firstName && invoice.lastName 
                      ? `${invoice.firstName} ${invoice.lastName}` 
                      : 'N/A'}
                  </td>
                  
                  <td className="status-cell">
                    {getStatusIcon(invoice.status)}
                  </td>
                
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="text-center text-muted mt-3">
          Showing {indexOfFirstInvoice + 1}-{Math.min(indexOfLastInvoice, filteredInvoices.length)} of {filteredInvoices.length} invoices
        </div>

        {/* CoreUI Centered Pagination */}
        <CRow className="mt-3">
          <CCol xs={12} className="d-flex justify-content-center">
            <CPagination aria-label="Page navigation">
              <CPaginationItem 
                aria-label="Previous"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <span aria-hidden="true"><FontAwesomeIcon icon={faChevronLeft} /></span>
              </CPaginationItem>
              
              {getPageNumbers().map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <CPaginationItem key={`ellipsis-${index}`} disabled>...</CPaginationItem>
                ) : (
                  <CPaginationItem 
                    key={`page-${pageNumber}`} 
                    active={pageNumber === currentPage}
                    onClick={() => paginate(pageNumber)}
                  >
                    {pageNumber}
                  </CPaginationItem>
                )
              ))}
              
              <CPaginationItem 
                aria-label="Next"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <span aria-hidden="true"><FontAwesomeIcon icon={faChevronRight} /></span>
              </CPaginationItem>
            </CPagination>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default Invoices;