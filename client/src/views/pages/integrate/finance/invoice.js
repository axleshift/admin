import React, { useEffect } from 'react';
import { useGetFreightInvoiceQuery } from '../../../../state/financeApi';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CWidgetStatsF,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMoney, cilClock, cilWarning } from '@coreui/icons';
import logActivity from '../../../../utils/ActivityLogger'; // Import the logActivity function

const InvoicingDashboard = () => {
  const { data: invoices = [], isLoading, error } = useGetFreightInvoiceQuery();

  // Log user activity on component mount
  useEffect(() => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log activity when component mounts - user viewed invoice dashboard
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/invoicing',
      action: 'View Invoice Dashboard',
      description: 'User accessed the invoice management dashboard'
    });
    
    // Log errors if they occur
    if (error) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/invoicing',
        action: 'Error',
        description: `Error occurred while loading invoice data: ${error.message}`
      });
    }
    
    // Log when data successfully loads
    if (invoices.length > 0 && !isLoading) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/invoicing',
        action: 'Data Loaded',
        description: `Successfully loaded ${invoices.length} invoices`
      });
    }
  }, [invoices, error, isLoading]);

  // Compute statistics
  const stats = invoices.length > 0 ? {
    totalInvoices: invoices.length,
    pendingAmount: invoices
      .filter((inv) => inv.paymentStatus === 'Pending')
      .reduce((acc, curr) => acc + curr.amountDue, 0),
    overdueinvoices: invoices.filter(
      (inv) => inv.paymentStatus === 'Pending' && new Date(inv.dueDate) < new Date()
    ).length,
  } : { totalInvoices: 0, pendingAmount: 0, overdueinvoices: 0 };

  // Handle update status with activity logging
  const handleUpdateStatus = (invoiceId, newStatus) => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log the status update action
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/invoicing',
      action: 'Update Invoice Status',
      description: `User updated invoice ${invoiceId} status to ${newStatus}`
    });
    
    // Add your API call or state update logic here
    console.log(`Updating invoice ${invoiceId} to status ${newStatus}`);
  };

  // Handle create invoice with activity logging
  const handleCreateInvoice = () => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log the create invoice action
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/invoicing',
      action: 'Create Invoice',
      description: 'User initiated invoice creation process'
    });
    
    // Add your navigation or modal open logic here
    console.log('Creating new invoice');
  };

  if (isLoading) return <p>Loading invoices...</p>;
  if (error) return <p>Error loading invoices: {error.message}</p>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Invoice Management</h2>

      {/* Stats Widgets */}
      <CRow className="mb-4">
        <CCol sm={6} lg={4}>
          <CWidgetStatsF
            icon={<CIcon icon={cilMoney} height={24} />}
            title="Total Invoices"
            value={stats.totalInvoices.toString()}
            color="primary"
          />
        </CCol>
        <CCol sm={6} lg={4}>
          <CWidgetStatsF
            icon={<CIcon icon={cilClock} height={24} />}
            title="Pending Amount"
            value={`$${stats.pendingAmount.toLocaleString()}`}
            color="warning"
          />
        </CCol>
        <CCol sm={6} lg={4}>
          <CWidgetStatsF
            icon={<CIcon icon={cilWarning} height={24} />}
            title="Overdue Invoices"
            value={stats.overdueinvoices.toString()}
            color="danger"
          />
        </CCol>
      </CRow>

      {/* Invoice Table */}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Invoices</strong>
          <CButton color="primary" onClick={handleCreateInvoice}>Create Invoice</CButton>
        </CCardHeader>
        <CCardBody>
          {invoices.length > 0 ? (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Invoice ID</CTableHeaderCell>
                  <CTableHeaderCell>Customer ID</CTableHeaderCell>
                  <CTableHeaderCell>Amount Due</CTableHeaderCell>
                  <CTableHeaderCell>Due Date</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {invoices.map((invoice) => (
                  <CTableRow key={invoice._id}>
                    <CTableDataCell>{invoice.invoiceId}</CTableDataCell>
                    <CTableDataCell>{invoice.customerId}</CTableDataCell>
                    <CTableDataCell>
                      ${invoice.amountDue.toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        color={invoice.paymentStatus === 'Paid' ? 'success' : 
                              (new Date(invoice.dueDate) < new Date() ? 'danger' : 'warning')}
                      >
                        {invoice.paymentStatus}
                        {invoice.paymentStatus === 'Pending' && new Date(invoice.dueDate) < new Date() && ' (Overdue)'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {invoice.paymentStatus === 'Pending' && (
                        <CButton
                          color="success"
                          size="sm"
                          onClick={() => handleUpdateStatus(invoice.invoiceId, 'Paid')}
                        >
                          Mark as Paid
                        </CButton>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p className="text-center">No Data Available</p>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default InvoicingDashboard;