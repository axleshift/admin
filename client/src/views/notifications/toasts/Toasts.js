import React, { useRef, useState } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CToast,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
} from '@coreui/react';

const Toasts = () => {
  const [toasts, setToasts] = useState([]);
  const toaster = useRef();

  // Example toast components
  const exampleToast1 = (
    <CToast autohide={false} visible={true}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">CoreUI for React.js</strong>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>Hello, world! This is a toast message.</CToastBody>
    </CToast>
  );

  const exampleToast2 = (
    <CToast autohide={false} visible={true}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">CoreUI for React.js</strong>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>Hello, world! This is a toast message.</CToastBody>
    </CToast>
  );

  const exampleToast3 = (
    <CToast autohide={false} visible={true}>
      <CToastHeader closeButton>
      <CToastBody>
        Hello, world! This is a toast message.
        <div className="mt-2 pt-2 border-top">
          <CButton type="button" color="primary" size="sm">
            Take action
          </CButton>
          <CToastClose as={CButton} color="secondary" size="sm" className="ms-1">
            Close
          </CToastClose>
        </div>
      </CToastBody>
      </CToastHeader>
    </CToast>
  );
  const exampleToast4 = (
    <CToast animation={false} autohide={false} visible={true}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <div className="fw-bold me-auto">CoreUI for React.js</div>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>Hello, world! This is a toast message.</CToastBody>
    </CToast>
  )

  const showToasts = () => {
    setToasts([
      { id: 1, component: exampleToast1 },
      { id: 2, component: exampleToast2 },
      { id: 3, component: exampleToast3 },
      { id: 4, component: exampleToast4 },
    ]);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>React Toast</strong> <small>Examples</small>
          </CCardHeader>
          <CCardBody>
            <CButton color="primary" onClick={showToasts}>
              Show All Toasts
            </CButton>
            <CToaster ref={toaster} placement="top-end">
              {toasts.map((toast) => (
                <React.Fragment key={toast.id}>{toast.component}</React.Fragment>
              ))}
            </CToaster>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Toasts;