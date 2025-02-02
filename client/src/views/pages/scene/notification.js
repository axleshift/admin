import React, { useEffect, useState } from "react";
import socket from "../../../util/socket"; // Import the socket instance
import { CToast, CToastHeader, CToastBody, CToaster } from "@coreui/react";

const NotificationToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Listen for 'newUserRegistered' event from backend
    socket.on("newUserRegistered", (data) => {
      console.log("New user registered:", data);

      // Create toast message
      setToast(
        <CToast autohide={true} visible={true}>
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
            <strong className="me-auto">New Registration</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            <strong>{data.user.name}</strong> has registered as {data.user.role}.
          </CToastBody>
        </CToast>
      );
    });

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off("newUserRegistered");
    };
  }, []);

  return <CToaster placement="top-end">{toast}</CToaster>;
};

export default NotificationToast;
