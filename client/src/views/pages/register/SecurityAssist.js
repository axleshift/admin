import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CSpinner,
  CProgress,
  CProgressBar,
  CTooltip,
  CButton,
  CPopover,
  CListGroup,
  CListGroupItem,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CFormInput,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faExclamationTriangle, 
  faCheckCircle, 
  faInfoCircle,
  faRobot,
  faKey,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../utils/axiosInstance';
import PropTypes from 'prop-types';

const SecurityAssistant = ({ userData, onSecurityUpdate }) => {
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  // Trigger security analysis when user data changes
  useEffect(() => {
    if (isUserDataValid(userData)) {
      analyzeUserSecurity(userData);
    }
  }, [userData]);
  
  // Check if userData has necessary fields to perform security analysis
  const isUserDataValid = (data) => {
    return data && 
           data.firstName && 
           data.lastName && 
           data.email && 
           data.password &&
           data.role &&
           data.department;
  };
  
  // Call the backend security analysis API
  const analyzeUserSecurity = async (data) => {
    if (!data.password || data.password.length < 3) {
      return; // Don't analyze if password is too short or empty
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use axiosInstance instead of axios
      const response = await axiosInstance.post('/security/analyze-security', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        department: data.department
      });
      
      // Format the AI response if it's in an unwanted format
      if (response.data.securityAnalysis?.aiRecommendations?.analysis) {
        response.data.securityAnalysis.aiRecommendations.analysis = 
          formatAIResponse(response.data.securityAnalysis.aiRecommendations.analysis);
      }
      
      setSecurityAnalysis(response.data.securityAnalysis);
      
      // Notify parent component about security status
      if (onSecurityUpdate) {
        const securityStatus = {
          isSecure: getSecurityStatus(response.data.securityAnalysis),
          analysis: response.data.securityAnalysis
        };
        
        onSecurityUpdate(securityStatus);
        
        // Log security event using axiosInstance
        await axiosInstance.post('/security/log-security-event', {
          userId: data.userId || data.email,
          eventType: securityStatus.isSecure ? 'SECURITY_CHECK_PASSED' : 'SECURITY_CHECK_FAILED',
          details: {
            riskLevel: response.data.securityAnalysis.aiRecommendations.riskLevel,
            timestamp: new Date().toISOString(),
            passwordStrength: response.data.securityAnalysis.basicChecks.passwordStrength.strength,
            rolePrivilegeLevel: response.data.securityAnalysis.basicChecks.rolePrivilegeLevel.privilegeLevel
          }
        });
      }
    } catch (err) {
      console.error('Security analysis error:', err);
      setError(err.response?.data?.message || 'Error analyzing security');
    } finally {
      setLoading(false);
    }
  };

  // Format the AI response to make it more readable
 // Format the AI response to make it more readable
const formatAIResponse = (rawResponse) => {
    if (!rawResponse) return '';
    
    let formatted = rawResponse;
    
    // First, determine the format type (markdown with ** or ##)
    const hasMarkdownHeadings = /##\s+.+/.test(rawResponse);
    const hasAsteriskHeadings = /\*\*\d+\.\s.+?\*\*:/.test(rawResponse);
    
    if (hasMarkdownHeadings) {
      // Handle markdown heading format (## style)
      
      // Replace markdown headings with HTML headings
      formatted = formatted.replace(/##\s+(.+?):/g, '<h5>$1</h5>');
      formatted = formatted.replace(/##\s+(.+?)$/gm, '<h5>$1</h5>');
      
      // Format numbered lists
      formatted = formatted.replace(/(\d+)\.\s+\*\*(.+?)\*\*/g, '<p><strong>$1. $2</strong></p>');
      
      // Replace remaining bold items
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Format bullet points
      formatted = formatted.replace(/\*\s+(.+?)$/gm, '<li>$1</li>');
      
      // Wrap bullet points in ul tags
      formatted = formatted.replace(/(<li>.+?<\/li>\n)+/gs, '<ul>$&</ul>');
      
      // Add some spacing between sections
      formatted = formatted.replace(/<\/h5>/g, '</h5><div class="mb-3">');
      formatted = formatted.replace(/<h5>/g, '</div><h5>');
      
      // Remove the first closing div
      formatted = formatted.replace('</div>', '');
      
      // Add the last closing div
      formatted += '</div>';
      
    } else if (hasAsteriskHeadings) {
      // Handle the original format with ** headings
      
      // Format the overall risk assessment section
      formatted = formatted.replace(
        /\*\*(\d+)\.\s+Overall Risk Assessment:\*\*\s+(\w+)/i, 
        '<h5>1. Overall Risk Assessment</h5><p class="mb-3"><span class="badge bg-$2-color me-2">$2</span></p>'
      );
      
      // Format the security concerns section
      formatted = formatted.replace(
        /\*\*(\d+)\.\s+Specific Security Concerns:\*\*/i,
        '<h5>2. Specific Security Concerns</h5>'
      );
      
      // Format the recommendations section
      formatted = formatted.replace(
        /\*\*(\d+)\.\s+Recommendations to Improve Security:\*\*/i,
        '<h5>3. Recommendations to Improve Security</h5>'
      );
      
      // Format bold items
      formatted = formatted.replace(/\*\*\*([^*]+)\*\*/g, '<strong>• $1</strong>');
      
      // Replace asterisks for emphasis with proper styling
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      
      // Convert bullet points
      formatted = formatted.replace(/\*\s/g, '• ');
    }
    
    // Handle simple bold text (this can happen in any format)
    if (formatted.includes('**') && !formatted.includes('<strong>')) {
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }
    
    // Set appropriate colors for risk levels
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    riskLevels.forEach(level => {
      const pattern = new RegExp(`\\b${level}\\b`, 'gi');
      formatted = formatted.replace(pattern, `<span class="badge bg-${level.toLowerCase()}-color me-1">${level.toUpperCase()}</span>`);
    });
    
    // Replace newlines with paragraph breaks
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    // Ensure the content is wrapped in a paragraph at minimum
    if (!formatted.includes('<p>')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  };
  
  // Generate a secure password
  const generateSecurePassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each group
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    setPasswordCopied(false);
    setShowPasswordModal(true);
  };
  
  // Copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    
    // Reset copy message after 2 seconds
    setTimeout(() => {
      setPasswordCopied(false);
    }, 2000);
  };
  
  // Determine overall security status
  const getSecurityStatus = (analysis) => {
    if (!analysis) return false;
    
    const { basicChecks, aiRecommendations } = analysis;
    
    // Password must be at least moderate
    if (basicChecks.passwordStrength.strength === 'weak') {
      return false;
    }
    
    // Role privilege requires attention for elevated/critical roles
    if (basicChecks.rolePrivilegeLevel.privilegeLevel === 'critical') {
      return aiRecommendations.riskLevel !== 'high';
    }
    
    // Email should not be high risk
    if (basicChecks.emailRisk.riskLevel === 'high') {
      return false;
    }
    
    return true;
  };
  
  // Get appropriate color for risk level
  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'critical': return 'danger';
      case 'elevated': return 'warning';
      case 'standard': return 'success';
      default: return 'info';
    }
  };
  
  // Get appropriate color for password strength
  const getPasswordStrengthColor = (strength) => {
    switch(strength) {
      case 'strong': return 'success';
      case 'good': return 'info';
      case 'moderate': return 'warning';
      case 'weak': return 'danger';
      default: return 'secondary';
    }
  };
  
  if (!isUserDataValid(userData)) {
    return (
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          <strong>AI Security Assistant</strong>
        </CCardHeader>
        <CCardBody>
          <CAlert color="info">
            Enter user details to receive AI-powered security recommendations.
          </CAlert>
        </CCardBody>
      </CCard>
    );
  }
  
  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          <strong>AI Security Assistant</strong>
        </CCardHeader>
        <CCardBody className="text-center p-4">
          <CSpinner color="primary" />
          <p className="mt-3">Analyzing security with Gemini AI...</p>
        </CCardBody>
      </CCard>
    );
  }
  
  if (error) {
    return (
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          <strong>AI Security Assistant</strong>
        </CCardHeader>
        <CCardBody>
          <CAlert color="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </CAlert>
          <CButton 
            color="primary" 
            size="sm" 
            onClick={() => analyzeUserSecurity(userData)}
          >
            Try Again
          </CButton>
        </CCardBody>
      </CCard>
    );
  }
  
  if (!securityAnalysis) return null;
  
  const { basicChecks, aiRecommendations } = securityAnalysis;
  const passwordStrength = basicChecks.passwordStrength;
  const isSecure = getSecurityStatus(securityAnalysis);
  
  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          <strong>Gemini AI Security Assistant</strong>
        </CCardHeader>
        <CCardBody>
          {/* Overall Security Status */}
          <CAlert color={isSecure ? 'success' : 'warning'}>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={isSecure ? faCheckCircle : faExclamationTriangle} 
                className="me-2" 
                size="lg"
              />
              <div>
                <strong>
                  {isSecure ? 'Security Check Passed' : 'Security Recommendations'}
                </strong>
                <p className="mb-0">
                  {isSecure 
                    ? 'This user registration meets the security requirements.' 
                    : 'Please review the security recommendations below.'}
                </p>
              </div>
            </div>
          </CAlert>
          
          {/* Password Strength */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Password Strength:</strong>
              <div>
                <CBadge color={getPasswordStrengthColor(passwordStrength.strength)} className="me-2">
                  {passwordStrength.strength.toUpperCase()}
                </CBadge>
                <CButton 
                  color="primary" 
                  size="sm" 
                  onClick={generateSecurePassword}
                  title="Generate a secure password"
                >
                  <FontAwesomeIcon icon={faKey} className="me-1" />
                  Generate Secure Password
                </CButton>
              </div>
            </div>
            <CProgress className="mb-2">
              <CProgressBar 
                value={passwordStrength.score} 
                color={getPasswordStrengthColor(passwordStrength.strength)}
              />
            </CProgress>
            {passwordStrength.feedback.length > 0 && (
              <CListGroup small flush className="border rounded mb-3">
                {passwordStrength.feedback.map((item, index) => (
                  <CListGroupItem key={index}>
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                    {item}
                  </CListGroupItem>
                ))}
              </CListGroup>
            )}
          </div>
          
          {/* Role & Privilege */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Privilege Level:</strong>
              <CBadge color={getRiskColor(basicChecks.rolePrivilegeLevel.privilegeLevel)}>
                {basicChecks.rolePrivilegeLevel.privilegeLevel.toUpperCase()}
              </CBadge>
            </div>
            {basicChecks.rolePrivilegeLevel.requiresAdditionalVerification && (
              <CAlert color="info" className="small">
                <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                This role requires additional verification due to elevated privileges.
              </CAlert>
            )}
          </div>
          
          {/* Email Risk */}
          {basicChecks.emailRisk.riskFactors.length > 0 && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Email Risk Level:</strong>
                <CBadge color={getRiskColor(basicChecks.emailRisk.riskLevel)}>
                  {basicChecks.emailRisk.riskLevel.toUpperCase()}
                </CBadge>
              </div>
              <CListGroup small flush className="border rounded mb-3">
                {basicChecks.emailRisk.riskFactors.map((factor, index) => (
                  <CListGroupItem key={index}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-warning" />
                    {factor}
                  </CListGroupItem>
                ))}
              </CListGroup>
            </div>
          )}
          
          {/* AI Recommendations */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Gemini AI Security Analysis:</strong>
              <CBadge color={getRiskColor(aiRecommendations.riskLevel)}>
                {aiRecommendations.riskLevel.toUpperCase()} RISK
              </CBadge>
            </div>
            <CCard className="bg-light">
              <CCardBody>
                {/* Use dangerouslySetInnerHTML to render the formatted HTML */}
                <div 
                  className="analysis-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: aiRecommendations.analysis.replace(/\$2-color/g, getRiskColor(aiRecommendations.riskLevel)) 
                  }}
                />
              </CCardBody>
            </CCard>
          </div>
        </CCardBody>
      </CCard>
      
      {/* Password Generator Modal */}
      <CModal 
        visible={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
            Secure Password Generator
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            This password has been generated securely with a mix of uppercase, lowercase, 
            numbers, and special characters:
          </p>
          <CInputGroup className="mb-3">
            <CFormInput
              type="text"
              value={generatedPassword}
              readOnly
              className="border-end-0"
            />
            <CInputGroupText 
              className="bg-primary text-white cursor-pointer" 
              onClick={copyToClipboard}
            >
              <FontAwesomeIcon icon={faCopy} />
            </CInputGroupText>
          </CInputGroup>
          
          {passwordCopied && (
            <CAlert color="success" className="mt-3 mb-0 py-2">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Password copied to clipboard!
            </CAlert>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <CButton 
              color="secondary" 
              onClick={() => setShowPasswordModal(false)}
            >
              Close
            </CButton>
            <CButton 
              color="success" 
              onClick={() => {
                copyToClipboard();
                setShowPasswordModal(false);
              }}
            >
              Use This Password
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </>
  );
};

SecurityAssistant.propTypes = {
  userData: PropTypes.shape({
    userId: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired
  }),
  onSecurityUpdate: PropTypes.func.isRequired
};
export default SecurityAssistant;