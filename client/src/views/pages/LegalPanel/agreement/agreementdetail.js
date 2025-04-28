// AgreementDetail.jsx - Agreement review and acceptance page
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Markdown from 'react-markdown';

const AgreementDetail = () => {
  const { agreementId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const response = await axios.get(`/api/agreements/${agreementId}${token ? `?token=${token}` : ''}`);
        setAgreement(response.data.agreement);
        setLoading(false);
      } catch (err) {
        setError('Failed to load agreement details');
        setLoading(false);
      }
    };
    
    fetchAgreement();
  }, [agreementId, token]);
  
  const handleAccept = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms || !name || !email || !title) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await axios.post(`/api/agreements/${agreementId}/accept`, {
        name,
        email,
        title,
        token
      });
      
      setSubmitSuccess(true);
      
      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        navigate('/agreement-accepted', { 
          state: { 
            agreementType: agreement.type,
            storeName: agreement.storeName
          } 
        });
      }, 2000);
    } catch (err) {
      setError('Failed to accept agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <div>Loading agreement...</div>;
  if (error) return <div className="error">{error}</div>;
  
  // If agreement is already accepted or rejected
  if (agreement.status === 'Accepted' || agreement.status === 'Rejected') {
    return (
      <div className="agreement-status">
        <h2>{agreement.type} - {agreement.storeName}</h2>
        <div className="status-message">
          <div className={`status-badge large status-${agreement.status.toLowerCase()}`}>
            {agreement.status}
          </div>
          <p>
            This agreement was {agreement.status.toLowerCase()} on {new Date(agreement.respondedAt).toLocaleString()}.
          </p>
        </div>
        
        <div className="agreement-content card">
          <h3>Agreement Content</h3>
          <div className="content-area">
            <Markdown>{agreement.content}</Markdown>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="agreement-detail">
      <h2>{agreement.type} - {agreement.storeName}</h2>
      
      <div className="agreement-content card">
        <h3>Agreement Content</h3>
        <div className="content-area">
          <Markdown>{agreement.content}</Markdown>
        </div>
      </div>
      
      <div className="acceptance-form card">
        <h3>Accept Agreement</h3>
        {submitSuccess ? (
          <div className="success-message">
            Agreement accepted successfully!
          </div>
        ) : (
          <form onSubmit={handleAccept}>
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Job Title:</label>
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group checkbox">
              <input 
                type="checkbox" 
                id="acceptTerms" 
                checked={acceptedTerms} 
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <label htmlFor="acceptTerms">
                I confirm that I have read and accept the {agreement.type}.
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!acceptedTerms || submitting}
            >
              {submitting ? 'Processing...' : 'Accept Agreement'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AgreementDetail;