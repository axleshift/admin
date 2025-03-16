import React, { useEffect } from 'react';
import { useGetFreightAuditsQuery } from '../../../../state/financeApi';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CCard, CCardHeader, CCardBody } from '@coreui/react';
import logActivity from '../../../../utils/ActivityLogger'; // Import the logActivity function

const FreightAuditTable = () => {
  const { data: freightAudits, error, isLoading } = useGetFreightAuditsQuery();

  // Log user activity on component mount and when errors occur
  useEffect(() => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log activity when component mounts - user viewed freight audits
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/finance/freight-audits',
      action: 'View Freight Audits',
      description: 'User accessed the freight audit data table'
    });
    
    // Log errors if they occur
    if (error) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/finance/freight-audits',
        action: 'Error',
        description: `Error occurred while loading freight audit data: ${error.message}`
      });
    }
    
    // Log when data successfully loads
    if (freightAudits && !isLoading) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/finance/freight-audits',
        action: 'Data Loaded',
        description: `Successfully loaded ${freightAudits.length} freight audit records`
      });
    }
  }, [freightAudits, error, isLoading]);

  // Function to handle row click with activity logging
  const handleRowClick = (audit) => {
    const userName = sessionStorage.getItem('name');
    const userRole = sessionStorage.getItem('role');
    const userDepartment = sessionStorage.getItem('department');
    
    // Log activity when user clicks on a specific audit row
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: '/finance/freight-audits',
      action: 'View Audit Details',
      description: `User viewed details for shipment ID: ${audit.shipmentId}`
    });
    
    // You could expand this to show more details, open a modal, etc.
    console.log("Audit details:", audit);
  };

  if (isLoading) return <p>Loading freight audits...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <CCard>
      <CCardHeader>
        <h3>Freight Audit Data</h3>
      </CCardHeader>
      <CCardBody>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Shipment ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Audit Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Carrier Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Audit Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount Charged</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount Paid</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {freightAudits?.length > 0 ? (
              freightAudits.map((audit, index) => (
                <CTableRow 
                  key={index} 
                  onClick={() => handleRowClick(audit)}
                  style={{ cursor: 'pointer' }}
                >
                  <CTableDataCell>{audit.shipmentId}</CTableDataCell>
                  <CTableDataCell>{new Date(audit.auditDate).toLocaleDateString()}</CTableDataCell>
                  <CTableDataCell>{audit.carrierName}</CTableDataCell>
                  <CTableDataCell>{audit.auditStatus}</CTableDataCell>
                  <CTableDataCell>${audit.amountCharged.toFixed(2)}</CTableDataCell>
                  <CTableDataCell>${audit.amountPaid.toFixed(2)}</CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="6" className="text-center">
                  No Freight Audits Available
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default FreightAuditTable;