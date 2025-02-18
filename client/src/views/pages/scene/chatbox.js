import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CButton, CCard, CCardBody, CInputGroup, CFormInput } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../../scss/chat.scss';
import { useColorModes } from '@coreui/react';
import ActivityTracker from '../../../util/ActivityTracker'; // Adjust path as needed

const ChatContainer = () => {
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [requestType, setRequestType] = useState(null);
  const [pageAccessRequest, setPageAccessRequest] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Activity tracking states
  const [chatOpened, setChatOpened] = useState(false);
  const [messageDetails, setMessageDetails] = useState(null);
  const [accessRequested, setAccessRequested] = useState(false);
  const [pageAccessDetails, setPageAccessDetails] = useState(null);
  const [statusCheck, setStatusCheck] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5053');
    setSocket(newSocket);

    newSocket.on('permissionUpdated', (data) => {
      const statusMessage = `Access to ${data.permissions[0].replace('/', '')} has been granted by ${data.grantedBy}. You now have 24-hour access to this page.`;
      
      setMessages(prev => [...prev, {
        text: statusMessage,
        sender: 'gemini',
        type: 'status'
      }]);
    });

    newSocket.on('requestStatusUpdate', (data) => {
      let statusMessage = '';
      if (data.status === 'accepted') {
        statusMessage = `Your access request has been approved by ${data.respondedBy}. You now have 24-hour access to the requested page.`;
      } else if (data.status === 'cancelled') {
        statusMessage = `Your access request has been denied by ${data.respondedBy}. Please contact them for more information.`;
      }

      setMessages(prev => [...prev, {
        text: statusMessage,
        sender: 'gemini',
        type: 'status'
      }]);
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const checkRequestStatus = async () => {
    try {
      const username = sessionStorage.getItem("username");
      setStatusCheck(true); // Track status check activity
      
      const response = await axios.get(`http://localhost:5053/admin/request-status/${username}`);
      
      if (response.data.success && response.data.updates.length > 0) {
        response.data.updates.forEach(update => {
          const statusMessage = update.status === 'accepted' 
            ? `Your access request for ${update.metadata.pageName} has been approved by ${update.responseMetadata.respondedBy}. You now have 24-hour access.`
            : `Your access request for ${update.metadata.pageName} has been denied by ${update.responseMetadata.respondedBy}.`;
          
          setMessages(prev => [...prev, {
            text: statusMessage,
            sender: 'gemini',
            type: 'status'
          }]);
        });
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }
  };

  useEffect(() => {
    const statusInterval = setInterval(checkRequestStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const messageToSend = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, messageToSend]);
    
    // Track message activity with content details
    setMessageDetails({
      content: userInput,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await axios.post('http://localhost:5053/admin/chat', {
        message: userInput,
        conversationHistory,
      });

      const botReply = response.data.response;
      const updatedHistory = response.data.conversationHistory;

      setMessages(prev => [...prev, { 
        text: botReply, 
        sender: 'gemini' 
      }]);
      
      setConversationHistory(updatedHistory);

      if (userInput.toLowerCase().includes('status')) {
        checkRequestStatus();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, there was an error processing your message. Please try again.",
        sender: 'gemini'
      }]);
    }

    setUserInput('');
  };

  const handleRequestAccess = () => {
    setRequestType('access');
    setPageAccessRequest(null);
    setSelectedPage(null);
    setAccessRequested(true); // Track initial access request
  };

  const handlePageAccess = () => {
    setPageAccessRequest('page');
  };

  const handlePageSelect = async (page) => {
    const department = sessionStorage.getItem("department");
    const username = sessionStorage.getItem("username");
    const name = sessionStorage.getItem("name");
    setSelectedPage(page.name);
    setUserInput(`Requesting access to ${page.name} page.`);
    
    // Track page access request with detailed information
    setPageAccessDetails({
      pageName: page.name,
      pagePath: page.path,
      department: department,
      username: username,
      requestTime: new Date().toISOString()
    });
  
    try {
      const response = await axios.post("http://localhost:5053/admin/sendmessage", {
        requestType: "access",
        pageName: page.name,
        department,
        username,
        name,
        requestDetails: {
          pageUrl: page.path,
          requestTime: new Date().toISOString()
        }
      });
  
      if (response.data.success) {
        setMessages(prev => [...prev, 
          { text: `Requesting access to ${page.name} page.`, sender: 'user' },
          { text: "Your request has been sent to the department supervisor for approval. Type 'check status' anytime to see your request status.", sender: 'gemini' }
        ]);
      }
    } catch (error) {
      console.error("Failed to send request:", error);
      setMessages(prev => [...prev,
        { text: `Requesting access to ${page.name} page.`, sender: 'user' },
        { text: "Sorry, there was an error sending your request. Please try again.", sender: 'gemini' }
      ]);
    }
  
    setUserInput('');
    setPageAccessRequest(null);
  };

  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (newState) {
      setChatOpened(true); // Track chat opening activity
    }
  };

  const allNavItems = [
    { path: "/employeedash", name: "Dashboard"},
    { path: "/hrdash", name: "HR Dashboard"},
    { path: "/financedash", name: "Finance Dashboard"},
    { path: "/coredash", name: "Core Dashboard"},
    { path: "/logisticdash", name: "Logistic Dashboard"},
    { path: "/useractivity/index", name: "User Activity"  },
    { path: "/restore", name: "Restore" },
    { path: "/tack", name: "Button" },
    { path: "/freight/transaction", name: "Transactions" },
    { path: "/oversales", name: "Overview" },
    { path: "/worker", name: "Employees" },
    { path: "/jobposting", name: "Job Post"},
    { path: "/payroll", name: "Payroll" },
    { path: "/customer", name: "Customer"},
    { path: "/monthly", name: "Monthly" },
    { path: "/daily", name: "Daily" },
    { path: "/breakdown", name: "Breakdown" }
  ];

  return (
    <div>
      {/* Activity trackers with detailed information */}
      {chatOpened && (
        <ActivityTracker
          action="Chat Opened"
          description={`User opened the chat interface at ${new Date().toLocaleString()}`}
        />
      )}
      
      {messageDetails && (
        <ActivityTracker
          action="Message Sent"
          description={`User sent: "${messageDetails.content}" at ${new Date(messageDetails.timestamp).toLocaleString()}`}
        />
      )}
      
      {accessRequested && (
        <ActivityTracker
          action="Access Request Initiated"
          description={`User initiated the access request process at ${new Date().toLocaleString()}`}
        />
      )}
      
      {pageAccessDetails && (
        <ActivityTracker
          action="Page Access Requested"
          description={`User ${pageAccessDetails.username} from ${pageAccessDetails.department} dept requested access to ${pageAccessDetails.pageName} (${pageAccessDetails.pagePath}) at ${new Date(pageAccessDetails.requestTime).toLocaleString()}`}
        />
      )}

      {statusCheck && (
        <ActivityTracker
          action="Status Check"
          description={`User checked status of pending access requests at ${new Date().toLocaleString()}`}
        />
      )}

      <CButton
        color="primary"
        className="chat-bubble"
        onClick={toggleChat}
      >
        <FontAwesomeIcon icon={faCommentDots} size="lg" />
      </CButton>

      {isChatOpen && (
        <CCard
          className="chatbox-container"
          style={{
            backgroundColor: colorMode === 'dark' ? '#2c2c2c' : 'white',
            color: colorMode === 'dark' ? '#ffffff' : '#000000',
            height: '600px',
            maxHeight: '80vh',
          }}
        >
          <CCardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="chatbox-header" style={{ marginBottom: '10px' }}>
              <h6>Chat</h6>
              <CButton color="danger" size="sm" onClick={toggleChat}>
                ✖
              </CButton>
            </div>

            {isChatOpen && !requestType && (
              <CButton color="primary" onClick={handleRequestAccess} style={{ marginBottom: '10px' }}>
                Request Access
              </CButton>
            )}

            {isChatOpen && requestType === 'access' && !pageAccessRequest && (
              <CButton color="secondary" onClick={handlePageAccess} style={{ marginBottom: '10px' }}>
                Access a Page
              </CButton>
            )}

            {isChatOpen && pageAccessRequest === 'page' && (
              <div>
                <p>What page do you want to access?</p>
                <ul
                  style={{
                    listStyleType: 'none',
                    padding: '0',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {allNavItems.map((page, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      <CButton
                        color="info"
                        onClick={() => handlePageSelect(page)}
                        style={{ width: '100%' }}
                      >
                        {page.name}
                      </CButton>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPage && (
              <p style={{ marginTop: '10px' }}>You selected: {selectedPage}</p>
            )}

            <div
              className="message-area"
              style={{
                flex: '1',
                overflowY: 'auto',
                padding: '10px',
                backgroundColor: colorMode === 'dark' ? '#1f1f1f' : '#f9f9f9',
                borderRadius: '5px',
                marginBottom: '10px',
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender} ${msg.type || ''}`}
                  style={{
                    backgroundColor: msg.type === 'status' 
                      ? (colorMode === 'dark' ? '#2d4a3e' : '#e7f5ef')
                      : msg.sender === 'user'
                        ? '#007bff'
                        : colorMode === 'dark'
                          ? '#444'
                          : '#f1f1f1',
                    color: msg.sender === 'user' ? 'white' : 
                           msg.type === 'status' ? (colorMode === 'dark' ? '#90EE90' : '#006400') :
                           colorMode === 'dark' ? '#ffffff' : '#000000',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '5px',
                    maxWidth: '70%',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <CInputGroup className="input-area" style={{ marginTop: 'auto' }}>
              <CFormInput
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  backgroundColor: colorMode === 'dark' ? '#444' : '#fff',
                  color: colorMode === 'dark' ? '#fff' : '#000',
                  border: 'none',
                }}
              />
              <CButton color="primary" onClick={sendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </CButton>
            </CInputGroup>
          </CCardBody>
        </CCard>
      )}
    </div>
  );
};

export default ChatContainer;