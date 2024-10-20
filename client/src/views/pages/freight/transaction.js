import React, { useState } from "react"
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
  CBadge
} from "@coreui/react"
import CustomHeader from '../../../components/header/customhead'
import { useGetShippingQuery, useUpdateShippingMutation, useDeleteShippingMutation } from "../../../state/api"
import * as XLSX from 'xlsx'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from "@fortawesome/free-solid-svg-icons"

const Transaction = () => {
  const { data: shippingData, error, isLoading } = useGetShippingQuery()
  const [updateShipping] = useUpdateShippingMutation()
  const [deleteShipping] = useDeleteShippingMutation()
  const [newStatusMap, setNewStatusMap] = useState({})
  const [isUpdating, setIsUpdating] = useState(false) // New state to manage global updating
  const [isDeleting, setIsDeleting] = useState(false) // New state to manage global deleting

  // Handle status update for each shipping entry
  const handleUpdate = async (shippingId) => {
    setIsUpdating(true)
    try {
      const newStatus = newStatusMap[shippingId] || "Pending"  // Fallback to "Pending" if not set
      const deliveryDate = newStatus === "Delivered" ? new Date() : null

      await updateShipping({ id: shippingId, status: newStatus, deliveryDate })
      alert("Shipping status updated successfully!")
    } catch (err) {
      alert("Error updating shipping status.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (shippingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shipping entry?")
    if (confirmDelete) {
      setIsDeleting(true)
      try {
        await deleteShipping(shippingId)
        alert("Shipping entry deleted successfully!")
      } catch (err) {
        alert("Error deleting shipping entry.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDownload = () => {
    if (!shippingData) return

    const formattedData = shippingData.map((shipping) => ({
      CustomerName: shipping.customerName,
      OrderVolume: `${shipping.orderVolume} kg`,
      ShippingType: shipping.shippingType,
      OrderDate: new Date(shipping.orderDate).toLocaleDateString(),
      Status: shipping.status,
      DeliveryDate: shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : "N/A",
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")
    XLSX.writeFile(workbook, "shipping_transactions.xlsx")
  }

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
          {shippingData && shippingData.map((shipping) => (
            <CTableRow key={shipping._id}>
              <CTableDataCell>{shipping.customerName}</CTableDataCell>
              <CTableDataCell>{shipping.orderVolume}</CTableDataCell>
              <CTableDataCell>{shipping.shippingType}</CTableDataCell>
              <CTableDataCell>{new Date(shipping.orderDate).toLocaleDateString()}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={shipping.status === "Delivered" ? "success" : "warning"}>
                  {shipping.status}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                {shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleDateString() : "N/A"}
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
                  {isUpdating ? 'Updating...' : 'Update'}
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => handleDelete(shipping._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
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
