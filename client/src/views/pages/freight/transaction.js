import React, { useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CBadge,
} from '@coreui/react'
import CustomHeader from '../../../components/header/customhead'
import {
  useGetShippingQuery,
  useUpdateShippingMutation,
  useDeleteShippingMutation,
} from '../../../state/adminApi'
import Papa from 'papaparse';
import { saveAs } from 'file-saver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

const Transaction = () => {
  const { data: shippingData, error, isLoading } = useGetShippingQuery()
  const [updateShipping] = useUpdateShippingMutation()
  const [deleteShipping] = useDeleteShippingMutation()
  const [newStatusMap, setNewStatusMap] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (shippingId) => {
    setIsUpdating(true)
    try {
      const newStatus = newStatusMap[shippingId] || 'Pending'
      const deliveryDate = newStatus === 'Delivered' ? new Date() : null

      await updateShipping({ id: shippingId, status: newStatus, deliveryDate })
      alert('Shipping status updated successfully!')
    } catch (err) {
      alert('Error updating shipping status.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (shippingId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this shipping entry?')
    if (confirmDelete) {
      setIsDeleting(true)
      try {
        await deleteShipping(shippingId)
        alert('Shipping entry deleted successfully!')
      } catch (err) {
        alert('Error deleting shipping entry.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  
const handleDownload = () => {
  if (!shippingData) return;

  // Define the headers
  const headers = ['Customer Name', 'Order Volume (kg)', 'Shipping Type', 'Order Date', 'Status', 'Delivery Date'];

  // Prepare the data rows
  const rows = shippingData.map((shipping) => [
    shipping.customerName,
    `${shipping.orderVolume} kg`,
    shipping.shippingType,
    new Date(shipping.orderDate).toLocaleDateString(),
    shipping.status,
    shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : 'N/A',
  ]);

  // Combine headers and rows
  const csvContent = Papa.unparse([headers, ...rows]);

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'shipping_transactions.csv';
  a.click();

  URL.revokeObjectURL(url);
};

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading shipping data: {error.message}</p>

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="TRANSACTIONS" subtitle="List of Transactions" />
      </CRow>
      <CRow className="p-2">
        <CCol xs="auto">
          <CButton color="Gray" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
          </CButton>
        </CCol>
      </CRow>
      <CTable striped bordered hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Customer Name</CTableHeaderCell>
            <CTableHeaderCell>Order Volume (kg)</CTableHeaderCell>
            <CTableHeaderCell>Shipping Type</CTableHeaderCell>
            <CTableHeaderCell>Order Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Delivery Date</CTableHeaderCell>
            <CTableHeaderCell>Update Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {shippingData &&
            shippingData.map((shipping) => (
              <CTableRow key={shipping._id}>
                <CTableDataCell>{shipping.customerName}</CTableDataCell>
                <CTableDataCell>{shipping.orderVolume}</CTableDataCell>
                <CTableDataCell>{shipping.shippingType}</CTableDataCell>
                <CTableDataCell>{new Date(shipping.orderDate).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={shipping.status === 'Delivered' ? 'success' : 'warning'}>
                    {shipping.status}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  {shipping.deliveryDate
                    ? new Date(shipping.deliveryDate).toLocaleDateString()
                    : 'N/A'}
                </CTableDataCell>
                <CTableDataCell>
                  <CFormSelect
                    aria-label="Select Shipping Status"
                    value={newStatusMap[shipping._id] || shipping.status}
                    onChange={(e) =>
                      setNewStatusMap((prev) => ({ ...prev, [shipping._id]: e.target.value }))
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </CFormSelect>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => handleUpdate(shipping._id)}
                    disabled={isUpdating}
                  >
                    Update
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleDelete(shipping._id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
        </CTableBody>
      </CTable>
    </CContainer>
  )
}

export default Transaction
