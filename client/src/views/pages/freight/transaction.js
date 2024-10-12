import React, { useState } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardFooter,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormSelect,
} from "@coreui/react";
import CustomHeader from '../../../components/header/customhead';
import { useGetShippingQuery, useUpdateShippingMutation, useDeleteShippingMutation } from "../../../state/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const ShippingCard = ({ shipping, onUpdate, onDelete }) => {
  const [newStatus, setNewStatus] = useState(shipping.status);
  const [deliveryDate, setDeliveryDate] = useState(shipping.deliveryDate);

  const handleUpdate = async () => {
    try {
      if (newStatus === "Delivered") {
        setDeliveryDate(new Date()); // Set the delivery date to now
      }

      await onUpdate({ 
        id: shipping._id, 
        status: newStatus, 
        deliveryDate: newStatus === "Delivered" ? new Date() : null 
      });
      alert("Shipping status updated successfully!");
    } catch (error) {
      alert("Failed to update shipping status: " + error.message);
    }
  };

  return (
    <CTableRow>
      <CTableDataCell>{shipping.customerId?.name || 'N/A'}</CTableDataCell>
      <CTableDataCell>{shipping.product?.name || 'N/A'}</CTableDataCell>
      <CTableDataCell>{shipping.orderVolume} kg</CTableDataCell>
      <CTableDataCell>{shipping.shippingType}</CTableDataCell>
      <CTableDataCell>{new Date(shipping.orderDate).toLocaleDateString()}</CTableDataCell>
      <CTableDataCell>{shipping.dropOffLocation || 'N/A'}</CTableDataCell>
      <CTableDataCell>{shipping.destinationCountry || 'N/A'}</CTableDataCell>
      <CTableDataCell>
        <strong>{newStatus}</strong>
        {newStatus === "Delivered" && deliveryDate && (
          <div>
            Delivery Date: <strong>{new Date(deliveryDate).toLocaleString()}</strong>
          </div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <CFormSelect
          aria-label="Select Shipping Status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </CFormSelect>
      </CTableDataCell>
      <CTableDataCell>
        <CButton color="warning" size="sm" onClick={handleUpdate}>
          Update Status
        </CButton>
        <CButton color="danger" size="sm" onClick={() => onDelete(shipping._id)}>
          Delete
        </CButton>
      </CTableDataCell>
    </CTableRow>
  );
};

const Transaction = () => {
  const { data: shippingData, error, isLoading } = useGetShippingQuery();
  const [updateShipping] = useUpdateShippingMutation();
  const [deleteShipping] = useDeleteShippingMutation();

  const handleExport = () => {
    const csvData = [
      ["Customer Name", "Order Volume", "Shipping Type", "Order Date", "Drop Off Location", "Destination Country", "Status", "Delivery Date"],
      ...(shippingData || []).map((shipping) => [
        shipping.customerId?.name || 'N/A',
        shipping.orderVolume,
        shipping.shippingType,
        new Date(shipping.orderDate).toLocaleDateString(),
        shipping.dropOffLocation || 'N/A',
        shipping.destinationCountry || 'N/A',
        shipping.status,
        shipping.deliveryDate ? new Date(shipping.deliveryDate).toLocaleString() : "N/A",
      ]),
    ];

    const csvContent = csvData.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shipping_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading shipping data: {error.message}</p>;

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CCol>
          <CCard>
            <CCardBody>
              <CCardTitle>Shipping Transactions</CCardTitle>
              <CButton color="gray" onClick={handleExport}>
               <FontAwesomeIcon icon ={faDownload}/>
              </CButton>
              <CTable striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Customer Name</CTableHeaderCell>
                    <CTableHeaderCell>Order Volume</CTableHeaderCell>
                    <CTableHeaderCell>Shipping Type</CTableHeaderCell>
                    <CTableHeaderCell>Order Date</CTableHeaderCell>
                    <CTableHeaderCell>Drop Off Location</CTableHeaderCell>
                    <CTableHeaderCell>Destination Country</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shippingData.map((shipping) => (
                    <ShippingCard
                      key={shipping._id}
                      shipping={shipping}
                      onUpdate={updateShipping}
                      onDelete={deleteShipping}
                    />
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
            <CCardFooter>End of Transactions</CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Transaction;
