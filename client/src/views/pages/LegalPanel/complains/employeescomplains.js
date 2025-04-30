import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormCheck,
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faIdBadge,
  faUser,
  faBuilding,
  faExclamationTriangle,
  faFireAlt,
  faUserSecret,
  faCommentAlt,
  faCheckCircle,
  faExclamationCircle,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../../utils/axiosInstance';

export default function EmployeeComplaintForm() {
  // Initialize state with default empty values
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    employeeEmail: '',
    employeeUsername: '',
    complaintType: '',
    complaintText: '',
    urgency: 'Medium',
    isAnonymous: false
  });

  // Load data from localStorage in useEffect to ensure client-side execution
  useEffect(() => {
    // Log localStorage values for debugging
    console.log('Loading from localStorage:');
    console.log('userId:', localStorage.getItem('userId'));
    console.log('name:', localStorage.getItem('name'));
    console.log('department:', localStorage.getItem('department'));
    console.log('email:', localStorage.getItem('email'));
    console.log('username:', localStorage.getItem('username'));
    
    setFormData(prevData => ({
      ...prevData,
      employeeId: localStorage.getItem('userId') || '',
      employeeName: localStorage.getItem('name') || '',
      department: localStorage.getItem('department') || '',
      employeeEmail: localStorage.getItem('email') || '',
      employeeUsername: localStorage.getItem('username') || ''
    }));
  }, []);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [debug, setDebug] = useState(null);

  const departments = [
    'HR', 'Finance', 'Core', 'Logistics', 'Administrative'
  ];

  const complaintTypes = [
    'Workplace Harassment', 'Pay Issues', 'Working Conditions',
    'Management Issues', 'Other'
  ];

  const urgencyLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.employeeEmail.trim()) newErrors.employeeEmail = 'Employee email is required';
    if (!formData.employeeUsername.trim()) newErrors.employeeUsername = 'Employee username is required';
    if (!formData.complaintType) newErrors.complaintType = 'Complaint type is required';
    if (!formData.complaintText.trim()) newErrors.complaintText = 'Complaint details are required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Log the data being submitted
    console.log('Submitting form data:', formData);
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Use the correct endpoint that matches the backend route
      const response = await axiosInstance.post('/complains/employeecomplain', formData);
      
      console.log('Server response:', response.data);
      
      setSubmitStatus({ 
        success: true, 
        message: response.data.message || 'Complaint submitted successfully' 
      });
      
      // Reset the complaint text field after successful submission but keep user info
      setFormData(prev => ({
        ...prev,
        complaintType: '',
        complaintText: '',
        urgency: 'Medium',
        isAnonymous: false
      }));
    } catch (error) {
      console.error('Error submitting complaint:', error);
     
      
      setSubmitStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit complaint. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CContainer className="py-4">
      <CRow className="justify-content-center">
        <CCol md={10}>
          <CCard>
            <CCardHeader className="text-center bg-light">
              <h4>
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Employee Complaint Form
              </h4>
              <small className="text-muted">Please provide the details of your complaint below</small>
            </CCardHeader>
            <CCardBody>
              {submitStatus && (
                <CAlert color={submitStatus.success ? 'success' : 'danger'}>
                  <FontAwesomeIcon
                    icon={submitStatus.success ? faCheckCircle : faExclamationCircle}
                    className="me-2"
                  />
                  {submitStatus.message}
                </CAlert>
              )}
              
           

              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="employeeUsername">
                      <FontAwesomeIcon icon={faIdBadge} className="me-1" /> Employee Username *
                    </CFormLabel>
                    <CFormInput
                      id="employeeUsername"
                      name="employeeUsername"
                      value={formData.employeeUsername}
                      onChange={handleChange}
                      invalid={!!errors.employeeUsername}
                    />
                    {errors.employeeUsername && <div className="invalid-feedback d-block">{errors.employeeUsername}</div>}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="employeeName">
                      <FontAwesomeIcon icon={faUser} className="me-1" /> Employee Name *
                    </CFormLabel>
                    <CFormInput
                      id="employeeName"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleChange}
                      invalid={!!errors.employeeName}
                    />
                    {errors.employeeName && <div className="invalid-feedback d-block">{errors.employeeName}</div>}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="employeeEmail">
                      <FontAwesomeIcon icon={faEnvelope} className="me-1" /> Employee Email *
                    </CFormLabel>
                    <CFormInput
                      id="employeeEmail"
                      name="employeeEmail"
                      type="email"
                      value={formData.employeeEmail}
                      onChange={handleChange}
                      invalid={!!errors.employeeEmail}
                    />
                    {errors.employeeEmail && <div className="invalid-feedback d-block">{errors.employeeEmail}</div>}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="employeeId">
                      <FontAwesomeIcon icon={faIdBadge} className="me-1" /> Employee ID *
                    </CFormLabel>
                    <CFormInput
                      id="employeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      invalid={!!errors.employeeId}
                    />
                    {errors.employeeId && <div className="invalid-feedback d-block">{errors.employeeId}</div>}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="department">
                      <FontAwesomeIcon icon={faBuilding} className="me-1" /> Department *
                    </CFormLabel>
                    <CFormSelect
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      invalid={!!errors.department}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </CFormSelect>
                    {errors.department && <div className="invalid-feedback d-block">{errors.department}</div>}
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="complaintType">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" /> Complaint Type *
                    </CFormLabel>
                    <CFormSelect
                      id="complaintType"
                      name="complaintType"
                      value={formData.complaintType}
                      onChange={handleChange}
                      invalid={!!errors.complaintType}
                    >
                      <option value="">Select Complaint Type</option>
                      {complaintTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </CFormSelect>
                    {errors.complaintType && <div className="invalid-feedback d-block">{errors.complaintType}</div>}
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="urgency">
                      <FontAwesomeIcon icon={faFireAlt} className="me-1" /> Urgency Level
                    </CFormLabel>
                    <CFormSelect
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                    >
                      {urgencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6} className="d-flex align-items-end">
                    <CFormCheck
                      id="isAnonymous"
                      name="isAnonymous"
                      label={
                        <>
                          Submit Anonymously <FontAwesomeIcon icon={faUserSecret} className="ms-1 text-muted" />
                        </>
                      }
                      checked={formData.isAnonymous}
                      onChange={handleChange}
                    />
                  </CCol>
                </CRow>

                <CFormLabel htmlFor="complaintText">
                  <FontAwesomeIcon icon={faCommentAlt} className="me-1" /> Complaint Details *
                </CFormLabel>
                <CFormTextarea
                  id="complaintText"
                  name="complaintText"
                  rows={5}
                  value={formData.complaintText}
                  onChange={handleChange}
                  invalid={!!errors.complaintText}
                  placeholder="Please provide detailed information about your complaint..."
                />
                {errors.complaintText && <div className="invalid-feedback d-block">{errors.complaintText}</div>}

                <div className="text-center mt-4">
                  <CButton type="submit" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? <CSpinner size="sm" className="me-2" /> : null}
                    Submit Complaint
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
}