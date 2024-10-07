import React, { useState } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardText,
  CCardBody,
  CCardTitle,
  CCardFooter,
  CButton,
  CCollapse,
  CFormSelect,
} from "@coreui/react";
import CustomHeader from '../../../components/header/customhead';
import { useGetShippingQuery, useUpdateShippingMutation, useDeleteShippingMutation } from "../../../state/api";

const ShippingCard = ({ shipping }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updateShipping, { isLoading: isUpdating }] = useUpdateShippingMutation();
  const [deleteShipping, { isLoading: isDeleting }] = useDeleteShippingMutation();
  const [newStatus, setNewStatus] = useState(shipping.status);
  const [deliveryDate, setDeliveryDate] = useState(shipping.deliveryDate);

  const handleUpdate = async () => {
    if (newStatus) {
      if (newStatus === "Delivered") {
        setDeliveryDate(new Date()); // Set the delivery date to now
      }

      await updateShipping({ id: shipping._id, status: newStatus, deliveryDate: newStatus === "Delivered" ? new Date() : null });

      alert("Shipping status updated successfully!");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shipping entry?");
    if (confirmDelete) {
      await deleteShipping(shipping._id);
      alert("Shipping entry deleted successfully!");
    }
  };

  return (
    <CCard style={{ margin: '10px' }}>
      <CCardBody>
        <CCardTitle>Customer Name: {shipping.customerName}</CCardTitle>
        <CCardText>
          Order Volume: {shipping.orderVolume} kg
        </CCardText>
        <CCardText>
          Shipping Type: {shipping.shippingType}
        </CCardText>
        <CCardText>
          Order Date: {new Date(shipping.orderDate).toLocaleDateString()}
        </CCardText>

        <CCardText>
          Current Status: <strong>{newStatus}</strong>
        </CCardText>

        {newStatus === "Delivered" && deliveryDate && (
          <CCardText>
            Delivery Date: <strong>{new Date(deliveryDate).toLocaleString()}</strong>
          </CCardText>
        )}

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
      </CCardBody>
      <CCardFooter>
        <CButton color="primary" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'See less' : 'See more'}
        </CButton>
        <CButton color="warning" size="sm" onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Status'}
        </CButton>
        <CButton color="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </CButton>
      </CCardFooter>

      {isExpanded && (
        <CCollapse in={isExpanded} timeout={300}>
          <CCardBody>
            <CCardText>
              Additional details could go here.
            </CCardText>
          </CCardBody>
        </CCollapse>
      )}
    </CCard>
  );
};

const Transaction = () => {
  const { data: shippingData, error, isLoading } = useGetShippingQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading shipping data: {error.message}</p>;

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="TRANSACTIONS" subtitle="List of Transactions" />
      </CRow>
      <CRow>
        {shippingData && shippingData.length > 0 ? (
          shippingData.map((shipping) => (
            <CCol key={shipping._id} xs="12" md="6" lg="4">
              <ShippingCard shipping={shipping} />
            </CCol>
          ))
        ) : (
          <p>No shipping data available.</p>
        )}
      </CRow>
    </CContainer>
  );
};

export default Transaction;
