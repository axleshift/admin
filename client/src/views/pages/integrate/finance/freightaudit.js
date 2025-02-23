import React from 'react';
import { useGetFreightAuditsQuery } from '../../../../state/financeApi';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';

const FreightAuditTable = () => {
  const { data: freightAudits, error, isLoading } = useGetFreightAuditsQuery();

  if (isLoading) return <p>Loading freight audits...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div>
      <h3>Freight Audit Data</h3>
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
              <CTableRow key={index}>
                <CTableDataCell>{audit.shipmentId}</CTableDataCell>
                <CTableDataCell>{new Date(audit.auditDate).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>{audit.carrierName}</CTableDataCell>
                <CTableDataCell>{audit.auditStatus}</CTableDataCell>
                <CTableDataCell>{audit.amountCharged}</CTableDataCell>
                <CTableDataCell>{audit.amountPaid}</CTableDataCell>
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
    </div>
  );
};

export default FreightAuditTable;
