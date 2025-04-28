// AdminAgreementCreate.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MDEditor from '@uiw/react-md-editor';

const AdminAgreementCreate = () => {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [agreementType, setAgreementType] = useState('Terms & Conditions');
  const [agreementVersion, setAgreementVersion] = useState('1.0');
  const [agreementContent, setAgreementContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [createdAgreementId, setCreatedAgreementId] = useState(null);
  
  // For notification step
  const [showNotify, setShowNotify] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  
  useEffect(() => {
    // Fetch stores for dropdown
    const fetchStores = async () => {
      try {
        const response = await axios.get('/api/stores');
        setStores(response.data.stores);
      } catch (err) {
        setError('Failed to load stores');
      }
    };
    
    fetchStores();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storeId || !agreementType || !agreementContent || !agreementVersion) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/agreements/create', {
        storeId,
        agreementType,
        agreementContent,
        agreementVersion
      });
      
      setSuccess(true);
      setCreatedAgreementId(response.data.agreement.id);
      setShowNotify(true);
      
      // Get store details for notification
      const store = stores.find(s => s._id === storeId);
      if (store && store.contactEmail) {
        setRecipientEmail(store.contactEmail);
        setRecipientName(store.contactName || '');
      }
    } catch (err) {
      setError('Failed to create agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!recipientEmail) {
      setError('Email address is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`/api/agreements/notify/${createdAgreementId}`, {
        email: recipientEmail,
        name: recipientName
      });
      
      setNotifySuccess(true);
    } catch (err) {
      setError('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (notifySuccess) {
    return (
      <div className="agreement-create">
        <div className="success-container card">
          <h2>Agreement Created & Notification Sent!</h2>
          <p>The store has been notified about the new agreement.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSuccess(false);
              setShowNotify(false);
              setNotifySuccess(false);
              setCreatedAgreementId(null);
              setAgreementContent('');
              setStoreId('');
            }}
          >
            Create Another Agreement
          </button>
        </div>
      </div>
    );
  }
  
  if (showNotify && createdAgreementId) {
    return (
      <div className="agreement-create">
        <h2>Send Agreement Notification</h2>
        
        <div className="card">
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label htmlFor="recipientEmail">Recipient Email:</label>
              <input 
                type="email" 
                id="recipientEmail" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name:</label>
              <input 
                type="text" 
                id="recipientName" 
                value={recipientName} 
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <div className="action-buttons">
              <button 
                type="button"
                className="btn"
                onClick={() => setShowNotify(false)}
                disabled={loading}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="agreement-create">
      <h2>Create New Agreement</h2>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="storeId">Store:</label>
            <select 
              id="storeId" 
              value={storeId} 
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              <option value="">Select a store</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="agreementType">Agreement Type:</label>
            <select 
              id="agreementType" 
              value={agreementType} 
              onChange={(e) => setAgreementType(e.target.value)}
              required
            >
              <option value="Terms & Conditions">Terms & Conditions</option>
              <option value="Contract">Contract</option>
              <option value="Privacy Policy">Privacy Policy</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="agreementVersion">Version:</label>
            <input 
              type="text" 
              id="agreementVersion" 
              value={agreementVersion} 
              onChange={(e) => setAgreementVersion(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="agreementContent">Agreement Content:</label>
            <MDEditor
              value={agreementContent}
              onChange={setAgreementContent}
              height={400}
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Agreement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAgreementCreate;