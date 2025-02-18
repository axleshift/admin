import React, { useEffect, useState } from "react";
import socket from "../../../util/socket"; // Import the socket instance
import { CToast, CToastHeader, CToastBody, CToaster } from "@coreui/react";

const NotificationToast = () => {
  const [toasts, setToasts] = useState([]); // Initialize state as an array

  useEffect(() => {
    // Handle "newUserRegistered" event
    const handleNewUserRegistered = (data) => {
      setToasts((prevToasts) => [
        ...prevToasts,
        <CToast autohide={true} visible={true} key={`reg-${data.user.id}`}>
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
        </CToast>,
      ]);
    };

    // Handle "permissionUpdated" event
    const handlePermissionUpdated = (data) => {
      setToasts((prevToasts) => [
        ...prevToasts,
        <CToast autohide={true} visible={true} key={`perm-${data.name}`}>
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
              <rect width="100%" height="100%" fill="#28a745"></rect>
            </svg>
            <strong className="me-auto">Permission Granted</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            User <strong>{data.grantedBy}</strong> granted access to user <strong>{data.name}</strong> for the following permissions:
            <br />
            <ul>
              {data.permissions.map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
          </CToastBody>
        </CToast>,
      ]);
    };

    // Handle "permissionRevoked" event
    const handlePermissionRevoked = (data) => {
      setToasts((prevToasts) => [
        ...prevToasts,
        <CToast autohide={true} visible={true} key={`revoke-${data.name}`}>
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
              <rect width="100%" height="100%" fill="#ff0000"></rect>
            </svg>
            <strong className="me-auto">Permission Revoked</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            Permissions <strong>{data.revokedPermissions.join(", ")}</strong> were revoked for user <strong>{data.name}</strong>.
          </CToastBody>
        </CToast>,
      ]);
    };

    // Handle "requestStatusUpdate" event
    const handleRequestStatusUpdate = (data) => {
      console.log("Received requestStatusUpdate event:", data);

      const { status, messageId, respondedBy, pageName } = data;
      const statusText = status === "accepted" ? "granted" : "denied";
      const color = status === "accepted" ? "#28a745" : "#ff0000";

      setToasts((prevToasts) => [
        ...prevToasts,
        <CToast autohide={true} visible={true} key={`status-${messageId}`}>
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
              <rect width="100%" height="100%" fill={color}></rect>
            </svg>
            <strong className="me-auto">Request Status</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            Your access request for <strong>{pageName}</strong> was <strong>{statusText}</strong> by <strong>{respondedBy}</strong>.
          </CToastBody>
        </CToast>,
      ]);
    };

    // Register event listeners
    socket.on("newUserRegistered", handleNewUserRegistered);
    socket.on("permissionUpdated", handlePermissionUpdated);
    socket.on("permissionRevoked", handlePermissionRevoked);
    socket.on("requestStatusUpdate", handleRequestStatusUpdate);

    // Cleanup the listeners when the component unmounts
    return () => {
      socket.off("newUserRegistered", handleNewUserRegistered);
      socket.off("permissionUpdated", handlePermissionUpdated);
      socket.off("permissionRevoked", handlePermissionRevoked);
      socket.off("requestStatusUpdate", handleRequestStatusUpdate);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return <CToaster placement="top-end">{toasts}</CToaster>; // Display all toasts
};

export default NotificationToast;
