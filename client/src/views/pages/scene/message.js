import React, { useState, useEffect } from "react";
import axios from "axios";
import { CCard, CCardBody, CButton, CSpinner } from "@coreui/react";
import "./../../../scss/message.scss";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchMessages = async () => {
    try {
      const userDepartment = sessionStorage.getItem("department");
      const userRole = sessionStorage.getItem("role");
  
      console.log("Fetching messages for:", { userDepartment, userRole });
  
      if (!userDepartment || userRole !== "superadmin") {
        setError("You do not have permission to view these messages.");
        setLoading(false);
        return;
      }
  
      // Add timeout to the request
      const response = await axios.get(
        `http://localhost:5053/admin/getmessages/${userDepartment}`, 
        {
          params: {
            role: userRole
          },
          timeout: 5000, // 5 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(response.data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check if the server is running.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(`Failed to load messages: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [lastRefresh]);

  const handleMessageAction = async (messageId, status) => {
    try {
      const responderUsername = sessionStorage.getItem("username");
      
      console.log("Updating message:", { messageId, status, responderUsername });
      
      // Update message status
      const response = await axios.put(
        `http://localhost:5053/admin/messages/${messageId}/status`,
        {
          status,
          responderUsername
        }
      );
  
      if (response.data.success) {
        // Remove the processed message from the list
        setMessages(messages.filter(msg => msg._id !== messageId));
        alert(`Message ${status}!`);
      } else {
        setError(response.data.error || 'Failed to update message status');
      }
    } catch (err) {
      console.error("Error updating message:", err);
      setError(err.response?.data?.error || `Failed to update message: ${err.message}`);
    }
  };

  const formatMessageContent = (content) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="message-line">
        {line.trim()}
      </p>
    ));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container">
      <div className="header-section">
        <h1>Access Request Messages</h1>
        <CButton 
          color="primary" 
          onClick={() => setLastRefresh(new Date())}
          style={{ marginBottom: '1rem' }}
        >
          Refresh Messages
        </CButton>
      </div>

      {loading ? (
        <div className="text-center">
          <CSpinner />
          <p>Loading messages...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : messages.length > 0 ? (
        <div className="messages-container">
          {messages.map((msg) => (
            <CCard key={msg._id} className="message-card mb-3">
              <CCardBody>
                <div className="message-content">
                  {formatMessageContent(msg.content)}
                  <p className="message-timestamp">
                    Requested: {formatTimestamp(msg.requestDetails?.requestTime)}
                  </p>
                </div>
                <div className="button-container">
                  <CButton
                    color="success"
                    onClick={() => handleMessageAction(msg._id, "accepted")}
                  >
                    Grant
                  </CButton>
                  <CButton
                    color="danger"
                    onClick={() => handleMessageAction(msg._id, "cancelled")}
                  >
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