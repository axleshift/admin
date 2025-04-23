import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance.js';
import { CCard, CCardBody, CCardHeader, CButton, CFormTextarea, CSpinner } from '@coreui/react';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/aiAssistant/assistant', { prompt });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error with AI assistant:', error.message);
      setResponse('Failed to get a response from the AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard>
      <CCardHeader>AI Assistant for User Management</CCardHeader>
      <CCardBody>
        <CFormTextarea
          rows="5"
          placeholder="Ask the AI assistant about user management..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <CButton color="primary" className="mt-3" onClick={handleAskAI} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Ask AI'}
        </CButton>
        {response && (
          <div className="mt-4">
            <h5>AI Response:</h5>
            <p>{response}</p>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default AIAssistant;