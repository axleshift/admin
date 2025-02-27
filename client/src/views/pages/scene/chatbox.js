import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  CButton, 
  CCard, 
  CCardBody, 
  CInputGroup, 
  CFormInput, 
  CFormSelect,
  CForm 
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCommentDots, 
  faPaperPlane, 
  faArrowLeft, 
  faUpload,
  faCheck 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../../scss/chat.scss';
import { useColorModes } from '@coreui/react';
import ActivityTracker from '../../../util/ActivityTracker';

const ChatContainer = () => {
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const isDark = colorMode === 'dark';
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [requestType, setRequestType] = useState(null);
  const [pageAccessRequest, setPageAccessRequest] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // New state variables for approval workflow
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [approvalFile, setApprovalFile] = useState(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  
  // Reference for file input
  const fileInputRef = useRef(null);
  
  // Activity tracking states
  const [chatOpened, setChatOpened] = useState(false);
  const [messageDetails, setMessageDetails] = useState(null);
  const [accessRequested, setAccessRequested] = useState(false);
  const [pageAccessDetails, setPageAccessDetails] = useState(null);
  const [statusCheck, setStatusCheck] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState(null);

  // Navigation items
  const allNavItems = [
    { path: "/employeedash", name: "Dashboard"},
    { path: "/hrdash", name: "HR Dashboard"},
    { path: "/financedash", name: "Finance Dashboard"},
    { path: "/coredash", name: "Core Dashboard"},
    { path: "/logisticdash", name: "Logistic Dashboard"},
    { path: "/useractivity/index", name: "User Activity" },
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
  
  // Department list for approval requests
  const departments = [
    { id: "hr", name: "Human Resources" },
    { id: "finance", name: "Finance" },
    { id: "logistics", name: "Logistics" },
    { id: "it", name: "Information Technology" },
    { id: "operations", name: "Operations" },
    { id: "management", name: "Management" }
  ];

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5053');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('permissionUpdated', (data) => {
      addMessage(`Access to ${data.permissions[0].replace('/', '')} has been granted by ${data.grantedBy}. You now have 24-hour access to this page.`, 'gemini', 'status');
    });

    newSocket.on('requestStatusUpdate', (data) => {
      const statusMessage = data.status === 'accepted'
        ? `Your access request has been approved by ${data.respondedBy}. You now have 24-hour access to the requested page.`
        : `Your access request has been denied by ${data.respondedBy}. Please contact them for more information.`;
      
      addMessage(statusMessage, 'gemini', 'status');
    });
    
    // New socket event for approval responses
    newSocket.on('approvalResponse', (data) => {
      const responseMessage = data.status === 'approved'
        ? `Your approval request to the ${data.department} department has been approved by ${data.respondedBy}.`
        : `Your approval request to the ${data.department} department has been denied by ${data.respondedBy}. Reason: ${data.reason || 'No reason provided.'}`;
      
      addMessage(responseMessage, 'gemini', 'status');
    });

    return () => newSocket && newSocket.disconnect();
  }, []);

  // Helper function to add messages
  const addMessage = (text, sender, type = null) => {
    setMessages(prev => [...prev, { text, sender, type }]);
  };

  // Handle going back in the workflow
  const handleBack = () => {
    if (pageAccessRequest === 'page') {
      setPageAccessRequest(null);
    } else if (approvalRequest === 'form') {
      setApprovalRequest(null);
      setSelectedDepartment('');
      setApprovalFile(null);
      setApprovalNote('');
    } else if (requestType) {
      setRequestType(null);
      setAccessRequested(false);
    }
  };

  // Check request status periodically
  const checkRequestStatus = async () => {
    try {
      const username = sessionStorage.getItem("username");
      setStatusCheck(true);
      
      const response = await axios.get(`http://localhost:5053/admin/request-status/${username}`);
      
      if (response.data.success && response.data.updates.length > 0) {
        response.data.updates.forEach(update => {
          const statusMessage = update.status === 'accepted' 
            ? `Your access request for ${update.metadata.pageName} has been approved by ${update.responseMetadata.respondedBy}. You now have 24-hour access.`
            : `Your access request for ${update.metadata.pageName} has been denied by ${update.responseMetadata.respondedBy}.`;
          
          addMessage(statusMessage, 'gemini', 'status');
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

  // Send message to the chat
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    addMessage(userInput, 'user');
    
    setMessageDetails({
      content: userInput,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await axios.post('http://localhost:5053/admin/chat', {
        message: userInput,
        conversationHistory,
      });

      addMessage(response.data.response, 'gemini');
      setConversationHistory(response.data.conversationHistory);

      if (userInput.toLowerCase().includes('status')) {
        checkRequestStatus();
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage("Sorry, there was an error processing your message. Please try again.", 'gemini');
    }

    setUserInput('');
  };

  // Handle page access request
  const handlePageSelect = async (page) => {
    const department = sessionStorage.getItem("department");
    const username = sessionStorage.getItem("username");
    const name = sessionStorage.getItem("name");
    setSelectedPage(page.name);
    setUserInput(`Requesting access to ${page.name} page.`);
    
    setPageAccessDetails({
      pageName: page.name,
      pagePath: page.path,
      department,
      username,
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
        addMessage(`Requesting access to ${page.name} page.`, 'user');
        addMessage("Your request has been sent to the department supervisor for approval. Type 'check status' anytime to see your request status.", 'gemini');
      }
    } catch (error) {
      console.error("Failed to send request:", error);
      addMessage(`Requesting access to ${page.name} page.`, 'user');
      addMessage("Sorry, there was an error sending your request. Please try again.", 'gemini');
    }
  
    setUserInput('');
    setPageAccessRequest(null);
    setRequestType(null);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setApprovalFile(e.target.files[0]);
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };
  
  // Submit approval request
  const submitApprovalRequest = async () => {
    if (!selectedDepartment) {
      addMessage("Please select a department to send your approval request.", "gemini");
      return;
    }
    
    if (!approvalFile) {
      addMessage("Please upload your approval letter document.", "gemini");
      return;
    }
    
    setFileUploading(true);
    const username = sessionStorage.getItem("username");
    const userDepartment = sessionStorage.getItem("department");
    const name = sessionStorage.getItem("name");
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', approvalFile);
    formData.append('requestType', 'approval');
    formData.append('targetDepartment', selectedDepartment);
    formData.append('username', username);
    formData.append('name', name);
    formData.append('userDepartment', userDepartment);
    formData.append('note', approvalNote);
    formData.append('timestamp', new Date().toISOString());
    
    setApprovalDetails({
      targetDepartment: departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment,
      fileName: approvalFile.name,
      fileSize: `${(approvalFile.size / 1024).toFixed(2)} KB`,
      note: approvalNote,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await axios.post('http://localhost:5053/admin/approval-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        addMessage(`Approval request submitted to ${departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment} department.`, 'user');
        addMessage("Your approval request and document have been sent. The department will review your request and respond soon. Type 'check status' anytime to see your request status.", 'gemini', 'status');
        setApprovalSubmitted(true);
        
        // Reset approval form
        setSelectedDepartment('');
        setApprovalFile(null);
        setApprovalNote('');
        setApprovalRequest(null);
        setRequestType(null);
      }
    } catch (error) {
      console.error("Failed to send approval request:", error);
      addMessage("Sorry, there was an error submitting your approval request. Please try again.", 'gemini');
    }
    
    setFileUploading(false);
  };

  // Toggle chat visibility
  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (newState) {
      setChatOpened(true);
    }
  };

  // Common styles
  const styles = {
    chatBox: {
      backgroundColor: isDark ? '#2c2c2c' : 'white',
      color: isDark ? '#ffffff' : '#000000',
      height: '600px',
      maxHeight: '80vh',
    },
    messageArea: {
      flex: '1',
      overflowY: 'auto',
      padding: '10px',
      backgroundColor: isDark ? '#1f1f1f' : '#f9f9f9',
      borderRadius: '5px',
      marginBottom: '10px',
    },
    input: {
      backgroundColor: isDark ? '#444' : '#fff',
      color: isDark ? '#fff' : '#000',
      border: 'none',
    },
    backButton: {
      marginRight: '8px',
      display: 'inline-flex',
      alignItems: 'center'
    },
    fileUpload: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: isDark ? '#3a3a3a' : '#f0f0f0',
      borderRadius: '5px',
    },
    fileInput: {
      display: 'none'
    },
    uploadButton: {
      marginRight: '10px'
    },
    fileName: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  };

  const showBackButton = requestType === 'access' || pageAccessRequest === 'page' || approvalRequest === 'form';

  return (
    <div>
      {/* Activity trackers */}
      {chatOpened && <ActivityTracker action="Chat Opened" description={`User opened the chat interface at ${new Date().toLocaleString()}`} />}
      {messageDetails && <ActivityTracker action="Message Sent" description={`User sent: "${messageDetails.content}" at ${new Date(messageDetails.timestamp).toLocaleString()}`} />}
      {accessRequested && <ActivityTracker action="Access Request Initiated" description={`User initiated the access request process at ${new Date().toLocaleString()}`} />}
      {pageAccessDetails && <ActivityTracker action="Page Access Requested" description={`User ${pageAccessDetails.username} from ${pageAccessDetails.department} dept requested access to ${pageAccessDetails.pageName} (${pageAccessDetails.pagePath}) at ${new Date(pageAccessDetails.requestTime).toLocaleString()}`} />}
      {statusCheck && <ActivityTracker action="Status Check" description={`User checked status of pending access requests at ${new Date().toLocaleString()}`} />}
      {approvalDetails && <ActivityTracker action="Approval Request Submitted" description={`User submitted approval request to ${approvalDetails.targetDepartment} department with file "${approvalDetails.fileName}" (${approvalDetails.fileSize}) at ${new Date(approvalDetails.timestamp).toLocaleString()}`} />}

      {/* Chat button */}
      <CButton color="primary" className="chat-bubble" onClick={toggleChat}>
        <FontAwesomeIcon icon={faCommentDots} size="lg" />
      </CButton>

      {/* Chat window */}
      {isChatOpen && (
        <CCard className="chatbox-container" style={styles.chatBox}>
          <CCardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div className="chatbox-header" style={{ marginBottom: '10px' }}>
              {showBackButton && (
                <CButton 
                  color="link" 
                  size="sm" 
                  style={styles.backButton} 
                  onClick={handleBack}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </CButton>
              )}
              <h6>Chat</h6>
              <CButton color="danger" size="sm" onClick={toggleChat}>✖</CButton>
            </div>

            {/* Controls - Main Request Options */}
            {!requestType && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <CButton 
                  color="primary" 
                  onClick={() => { 
                    setRequestType('access'); 
                    setAccessRequested(true); 
                  }}
                >
                  Request Access
                </CButton>
                <CButton 
                  color="success" 
                  onClick={() => setRequestType('approval')}
                >
                  Submit Approval
                </CButton>
              </div>
            )}

            {/* Page Access Option */}
            {requestType === 'access' && !pageAccessRequest && (
              <CButton 
                color="secondary" 
                onClick={() => setPageAccessRequest('page')} 
                style={{ marginBottom: '10px' }}
              >
                Access a Page
              </CButton>
            )}
            
            {/* Approval Request Form */}
            {requestType === 'approval' && !approvalRequest && (
              <CButton 
                color="secondary" 
                onClick={() => setApprovalRequest('form')} 
                style={{ marginBottom: '10px' }}
              >
                Submit Approval Form
              </CButton>
            )}
            
            {/* Approval Form */}
            {approvalRequest === 'form' && !approvalSubmitted && (
              <CForm>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="departmentSelect" style={{ display: 'block', marginBottom: '5px' }}>
                    Select Department:
                  </label>
                  <CFormSelect 
                    id="departmentSelect"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ marginBottom: '10px' }}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </CFormSelect>
                  
                  <div style={styles.fileUpload}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      style={styles.fileInput}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <CButton 
                      color="info" 
                      onClick={triggerFileUpload}
                      style={styles.uploadButton}
                      disabled={fileUploading}
                    >
                      <FontAwesomeIcon icon={faUpload} /> {fileUploading ? 'Uploading...' : 'Upload Letter'}
                    </CButton>
                    <div style={styles.fileName}>
                      {approvalFile ? approvalFile.name : 'No file selected'}
                    </div>
                  </div>
                  
                  <label htmlFor="approvalNote" style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>
                    Additional Notes:
                  </label>
                  <CFormInput
                    id="approvalNote"
                    type="textarea"
                    placeholder="Add any additional information about your approval request..."
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    style={{ marginBottom: '15px', minHeight: '80px' }}
                  />
                  
                  <CButton 
                    color="success" 
                    onClick={submitApprovalRequest}
                    disabled={!selectedDepartment || !approvalFile || fileUploading}
                    style={{ width: '100%' }}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Submit Approval Request
                  </CButton>
                </div>
              </CForm>
            )}

            {/* Page selection */}
            {pageAccessRequest === 'page' && (
              <div>
                <p>What page do you want to access?</p>
                <ul style={{ listStyleType: 'none', padding: '0', maxHeight: '200px', overflowY: 'auto' }}>
                  {allNavItems.map((page, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      <CButton color="info" onClick={() => handlePageSelect(page)} style={{ width: '100%' }}>
                        {page.name}
                      </CButton>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedPage && <p style={{ marginTop: '10px' }}>You selected: {selectedPage}</p>}

            {/* Message area */}
            <div className="message-area" style={styles.messageArea}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender} ${msg.type || ''}`}
                  style={{
                    backgroundColor: msg.type === 'status' 
                      ? (isDark ? '#2d4a3e' : '#e7f5ef')
                      : msg.sender === 'user'
                        ? '#007bff'
                        : isDark ? '#444' : '#f1f1f1',
                    color: msg.sender === 'user' ? 'white' : 
                           msg.type === 'status' ? (isDark ? '#90EE90' : '#006400') :
                           isDark ? '#ffffff' : '#000000',
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

            {/* Input area */}
            <CInputGroup className="input-area" style={{ marginTop: 'auto' }}>
              <CFormInput
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={styles.input}
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