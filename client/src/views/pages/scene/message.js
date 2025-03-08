import React, { useState, useEffect } from "react";
import { useGetDepartmentMessagesQuery, useUpdateMessageStatusMutation } from "../../../state/adminApi";
import { CCard, CCardBody, CButton, CSpinner } from "@coreui/react";
import "./../../../scss/message.scss";

const Message = () => {
  const department = sessionStorage.getItem("department");
  const role = sessionStorage.getItem("role");

  const { data, error, isLoading, refetch } = useGetDepartmentMessagesQuery({ department, role });
  const [updateMessageStatus] = useUpdateMessageStatusMutation();
  
  useEffect(() => {
    // Auto-refresh messages every 30 seconds
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleMessageAction = async (messageId, status) => {
    try {
      const responderUsername = sessionStorage.getItem("username");
      console.log("Updating message:", { messageId, status, responderUsername });

      await updateMessageStatus({ id: messageId, status, responderUsername }).unwrap();
      alert(`Access ${status}!`);
      refetch(); // Refresh messages after update
    } catch (err) {
      console.error("Error updating message:", err);
      alert("Failed to update message.");
    }
  };

  return (
    <div className="container">
      <div className="header-section">
        <h1>Access Request Messages</h1>
        <CButton color="primary" onClick={refetch} style={{ marginBottom: "1rem" }}>
          Refresh Messages
        </CButton>
      </div>

      {isLoading ? (
        <div className="text-center">
          <CSpinner />
          <p>Loading messages...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error.message || "Error fetching messages"}</div>
      ) : data?.messages?.length > 0 ? (
        <div className="messages-container">
          {data.messages.map((msg) => (
            <CCard key={msg._id} className="message-card mb-3">
              <CCardBody>
                <div className="message-content">
                  <p>{msg.content}</p>
                  <p className="message-timestamp">Requested: {new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <div className="button-container">
                  <CButton color="success" onClick={() => handleMessageAction(msg._id, "accepted")}>
                    Grant
                  </CButton>
                  <CButton color="danger" onClick={() => handleMessageAction(msg._id, "cancelled")}>
                    Reject
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          ))}
        </div>
      ) : (
        <CCard>
          <CCardBody>
            <p className="text-center">No pending access requests</p>
          </CCardBody>
        </CCard>
      )}
    </div>
  );
};

export default Message;
