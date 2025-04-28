import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/axiosInstance';
import { 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CCardFooter,
  CButton, 
  CAlert, 
  CContainer,
  CRow,
  CCol,
  CSpinner
} from '@coreui/react';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faFileContract, 
  faExclamationTriangle,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TermsAccept = () => {
  const [status, setStatus] = useState('pending'); // 'pending', 'accepted', 'rejected'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get userId and token from URL parameters
  const { id, token } = useParams();
  const navigate = useNavigate();

  // Validate that we have the required parameters
  useEffect(() => {
    if (!id || !token) {
      setError('Invalid link. This terms acceptance link appears to be incomplete or expired.');
    }
  }, [id, token]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      if (!id || !token) {
        setError('User ID or token not found in the URL. Please use the link sent to your email.');
        setLoading(false);
        return;
      }
      
      const payload = { 
        userId: id,
        token 
      };
      
      await axiosInstance.post('/agreement/accept', payload);
      setStatus('accepted');
      setLoading(false);
    } catch (err) {
      console.error('Error accepting terms:', err);
      setError('Failed to accept terms. The link may have expired or is invalid.');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      if (!id || !token) {
        setError('User ID or token not found in the URL. Please use the link sent to your email.');
        setLoading(false);
        return;
      }
      
      const payload = { 
        userId: id,
        token 
      };
      
      await axiosInstance.post('/agreement/reject', payload);
      setStatus('rejected');
      setLoading(false);
    } catch (err) {
      console.error('Error rejecting terms:', err);
      setError('Failed to record your rejection. The link may have expired or is invalid.');
      setLoading(false);
    }
  };

  // For accepted status
  if (status === 'accepted') {
    return (
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <CCard className="border-success shadow">
              <CCardHeader className="bg-success text-white d-flex align-items-center">
                <FontAwesomeIcon icon={faCheckCircle} size="lg" className="me-2" />
                <h2 className="mb-0">Thank You!</h2>
              </CCardHeader>
              <CCardBody className="text-center p-5">
                <FontAwesomeIcon icon={faCheckCircle} size="5x" className="text-success mb-4" />
                <h3>You have successfully accepted the Terms and Conditions.</h3>
                <p className="text-muted mt-3">You can now access your Account.</p>
                <CButton 
                  color="primary" 
                  onClick={() => navigate('/login')}
                  className="mt-4"
                >
                  Go to Login
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  // For rejected status
  if (status === 'rejected') {
    return (
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <CCard className="border-danger shadow">
              <CCardHeader className="bg-danger text-white d-flex align-items-center">
                <FontAwesomeIcon icon={faTimesCircle} size="lg" className="me-2" />
                <h2 className="mb-0">Terms Rejected</h2>
              </CCardHeader>
              <CCardBody className="text-center p-5">
                <FontAwesomeIcon icon={faExclamationTriangle} size="5x" className="text-danger mb-4" />
                <h3>You have rejected the Terms and Conditions</h3>
                <p className="text-muted mt-3">Some features of the application may be limited or unavailable.</p>
                <CButton 
                  color="secondary"
                  className="mt-4"
                  onClick={() => setStatus('pending')}
                >
                  <FontAwesomeIcon icon={faRedo} className="me-2" />
                  Review Terms Again
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  // For pending status (default view)
  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol>
          <CCard className="shadow-lg">
            <CCardHeader className="bg-primary text-white d-flex align-items-center">
              <FontAwesomeIcon icon={faFileContract} size="lg" className="me-2" />
              <h2 className="mb-0">Terms and Conditions</h2>
            </CCardHeader>
            <CCardBody>
              <div className="border rounded p-4 mb-4" style={{ height: '400px', overflowY: 'scroll' }}>
                {/* Terms and conditions content - same as your original component */}
                <h4 className="border-bottom pb-2 mb-3">Acceptance of Terms and Conditions</h4>
                <p className="mb-4">
                  By accessing and using the Freight Management System ("the System"), you acknowledge that you have read, understood, and agree to be bound by the following terms and conditions:
                </p>

                <h5 className="text-primary">1. Compliance with Laws</h5>
                <p className="mb-4">
                  You agree to comply with all applicable laws, regulations, and internal company policies governing freight operations, transportation, logistics, and administrative management.
                </p>

                <h5 className="text-primary">2. Accuracy of Information</h5>
                <p className="mb-4">
                  You certify that all information you provide, including personal details, certifications, licenses, insurance documents, and incident reports, is true, accurate, and up-to-date. Falsification or omission may result in account suspension, legal action, or termination.
                </p>

                <h5 className="text-primary">3. Certification and Documentation</h5>
                <p className="mb-4">
                  You agree to maintain valid, active certifications and licenses as required by law and company policy. It is your responsibility to upload and update necessary documents within the System.
                </p>

                <h5 className="text-primary">4. User Conduct</h5>
                <p className="mb-4">
                  You agree to use the System responsibly, and not engage in activities that could result in violations, misconduct, or harm to the organization's operations, reputation, or legal standing.
                </p>

                <h5 className="text-primary">5. Risk and Compliance Monitoring</h5>
                <p className="mb-4">
                  You understand that the System tracks user activity, certifications, violations, and risk profiles to ensure legal and regulatory compliance. You consent to such monitoring and acknowledge that serious breaches may result in corrective actions or legal proceedings.
                </p>

                <h5 className="text-primary">6. Confidentiality</h5>
                <p className="mb-4">
                  You agree to maintain the confidentiality of all data accessed through the System and refrain from unauthorized disclosure or misuse.
                </p>

                <h5 className="text-primary">7. Legal Holds and Investigations</h5>
                <p className="mb-4">
                  You acknowledge that your access may be restricted ("legal hold") in the event of an internal investigation, legal dispute, regulatory inquiry, or other legal matters, as determined by the Administrative Department.
                </p>

                <h5 className="text-primary">8. Amendments to Terms</h5>
                <p className="mb-4">
                  The organization reserves the right to modify these Terms and Conditions at any time. Continued use of the System after updates constitutes acceptance of the modified terms.
                </p>

                <p className="mt-4">
                  By clicking "I Accept", you affirm that you have read, understood, and agree to these Terms and Conditions, and you consent to abide by all policies and procedures set forth herein.
                </p>
              </div>

              {error && (
                <CAlert color="danger" className="d-flex align-items-center mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
                  {error}
                </CAlert>
              )}
              
              {(!id || !token) && (
                <CAlert color="warning" className="d-flex align-items-center mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="lg" className="me-2" />
                  Invalid terms acceptance link. Please use the link sent to your email.
                </CAlert>
              )}
            </CCardBody>
            <CCardFooter className="d-flex justify-content-end gap-3 bg-light">
              <CButton 
                color="success" 
                onClick={handleAccept}
                className="px-4"
                disabled={!id || !token || loading}
              >
                {loading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faCheckCircle} className="me-2" />}
                I Accept
              </CButton>
              <CButton 
                color="danger" 
                onClick={handleReject}
                className="px-4"
                disabled={!id || !token || loading}
              >
                {loading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faTimesCircle} className="me-2" />}
                I Reject
              </CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default TermsAccept;