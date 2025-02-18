import React, { useEffect, useState } from "react";
import socket from "../../../util/socket"; // Import the socket instance
import { CToast, CToastHeader, CToastBody, CToaster } from "@coreui/react";

const NotificationToast = () => {
  const [toasts, setToasts] = useState([]); // Initialize state as an array

  useEffect(() => {
    // Listen for 'newUserRegistered' event from backend
    const handleNewUserRegistered = (data) => {
      console.log("New user registered:", data);

      // Add new toast to the array
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

    // Listen for 'permissionUpdated' event from backend
    const handlePermissionUpdated = (data) => {
      console.log("permissionsUpdated", data);
    
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
            <strong className="me-auto">Permission Update</strong>
            <small>Just now</small>
          </CToastHeader>
          <CToastBody>
            User <strong>{data.grantedBy}</strong> granted the following permissions to user <strong>{data.name}</strong>: 
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
    



      const handlePermissionRevoked = (data) => {
        console.log("🔹 permissionRevoked Event Received:", data);
    
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


    socket.on('permissionRevoked', handlePermissionRevoked)
    socket.on("newUserRegistered", handleNewUserRegistered);
    socket.on("permissionUpdated", handlePermissionUpdated);

    // Cleanup the listeners when the component unmounts
    return () => {
      socket.on('permissionRevoked', handlePermissionRevoked)
      socket.off("newUserRegistered", handleNewUserRegistered);
      socket.off("permissionUpdated", handlePermissionUpdated);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return <CToaster placement="top-end">{toasts}</CToaster>; // Use "toasts" instead of "toast"
};

export default NotificationToast;
