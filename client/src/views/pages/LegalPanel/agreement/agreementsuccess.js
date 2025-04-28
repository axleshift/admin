// AgreementSuccess.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const AgreementSuccess = () => {
  const location = useLocation();
  const { agreementType, storeName } = location.state || {};
  
  return (
    <div className="agreement-success">
      <div className="success-container card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h2>Agreement Accepted!</h2>
        
        <p>
          You have successfully accepted the {agreementType || "agreement"} 
          {storeName ? ` for ${storeName}` : ""}.
        </p>
        
        <p>
          A confirmation email has been sent to your email address for your records.
          You can also access this agreement at any time from your dashboard.
        </p>
        
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgreementSuccess;