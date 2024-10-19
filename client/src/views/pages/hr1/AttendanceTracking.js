import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell
} from '@coreui/react';

const ReceivingDispatching = () => {
  const [receivingData, setReceivingData] = useState({
    productName: '',
    quantity: '',
    receivedFrom: '',
    location: ''
  });

  const [dispatchList, setDispatchList] = useState([
    { id: 1, product: 'Electronics', status: 'Pending', date: '2024-10-15' },
    { id: 2, product: 'Furniture', status: 'In Transit', date: '2024-10-16' }
  ]);

  const handleReceiveInputChange = (e) => {
    const { name, value } = e.target;
    setReceivingData({ ...receivingData, [name]: value });
  };

  const handleReceiveSubmit = (e) => {
    e.preventDefault();
    // Submit the receiving data to backend or update state
    console.log('Received Goods:', receivingData);
    // Clear form
    setReceivingData({
      productName: '',
      quantity: '',
      receivedFrom: '',
      location: ''
    });
  };

  const handleDispatchUpdate = (id, status) => {
    setDispatchList((prevList) =>
      prevList.map((dispatch) =>
        dispatch.id === id ? { ...dispatch, status } : dispatch
      )
    );
  };

  return (
    <div>
      {/* Receiving Section */}
      <CCard>
        <CCardHeader>
          <h4>Receiving Module</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleReceiveSubmit}>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Product Name</CFormLabel>
                <CFormInput
                  name="productName"
                  value={receivingData.productName}
                  onChange={handleReceiveInputChange}
                  placeholder="Enter Product Name"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Quantity</CFormLabel>
                <CFormInput
                  name="quantity"
                  value={receivingData.quantity}
                  onChange={handleReceiveInputChange}
                  placeholder="Enter Quantity"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Received From</CFormLabel>
                <CFormInput
                  name="receivedFrom"
                  value={receivingData.receivedFrom}
                  onChange={handleReceiveInputChange}
                  placeholder="Enter Supplier Name"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Storage Location</CFormLabel>
                <CFormInput
                  name="location"
                  value={receivingData.location}
                  onChange={handleReceiveInputChange}
                  placeholder="Enter Warehouse Location"
                  required
                />
              </CCol>
            </CRow>
            <CButton type="submit" color="primary" className="mt-3">
              Receive Goods
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

      {/* Dispatching Section */}
      <CCard className="mt-4">
        <CCardHeader>
          <h4>Dispatching Module</h4>
        </CCardHeader>
        <CCardBody>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Product</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Dispatch Date</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {dispatchList.map((dispatch) => (
                <CTableRow key={dispatch.id}>
                  <CTableHeaderCell>{dispatch.id}</CTableHeaderCell>
                  <CTableDataCell>{dispatch.product}</CTableDataCell>
                  <CTableDataCell>{dispatch.status}</CTableDataCell>
                  <CTableDataCell>{dispatch.date}</CTableDataCell>
                  <CTableDataCell>
                    {dispatch.status === 'Pending' && (
                      <CButton
                        color="success"
                        onClick={() => handleDispatchUpdate(dispatch.id, 'In Transit')}
                      >
                        Mark as Dispatched
                      </CButton>
                    )}
                    {dispatch.status === 'In Transit' && (
                      <CButton
                        color="warning"
                        onClick={() => handleDispatchUpdate(dispatch.id, 'Delivered')}
                      >
                        Mark as Delivered
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default ReceivingDispatching;
