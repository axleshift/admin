import React, { useState } from 'react';
import { CButton, CCard, CCardBody, CInputGroup, CFormInput } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../../scss/chat.scss';
import { useColorModes } from '@coreui/react';  // Import useColorModes

const ChatContainer = () => {
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      const response = await axios.post('http://localhost:5053/admin/chat', {
        message: userInput,
        conversationHistory,
      });

      const botReply = response.data.response;
      const updatedHistory = response.data.conversationHistory;

      setMessages([
        ...messages,
        { text: userInput, sender: 'user' },
        { text: botReply, sender: 'gemini' },
      ]);
      setConversationHistory(updatedHistory);
      setUserInput('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Floating Chat Bubble */}
      <CButton
        color="primary"
        className="chat-bubble"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <FontAwesomeIcon icon={faCommentDots} size="lg" />
      </CButton>

      {/* Chatbox (Visible only when isChatOpen is true) */}
      {isChatOpen && (
        <CCard
          className="chatbox-container"
          style={{
            backgroundColor: colorMode === 'dark' ? '#2c2c2c' : 'white',
            color: colorMode === 'dark' ? '#ffffff' : '#000000',
          }}
        >
          <CCardBody>
            <div className="chatbox-header">
              <h6>Chat</h6>
              <CButton color="danger" size="sm" onClick={() => setIsChatOpen(false)}>
                ✖
              </CButton>
            </div>

            <div className="message-area">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender}`}
                  style={{
                    backgroundColor: msg.sender === 'user'
                      ? (colorMode === 'dark' ? '#007bff' : '#007bff')
                      : (colorMode === 'dark' ? '#444' : '#f1f1f1'),
                    color: msg.sender === 'user' ? 'white' : (colorMode === 'dark' ? '#ffffff' : '#000000'),
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <CInputGroup className="input-area">
              <CFormInput
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
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
