import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

export default function IncidentReportUpload() {
  const { userId, token } = useParams(); // Get userId and token from URL params
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: 'Absence Explanation Report',
    description: '',
    location: '',
    severity: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);

  // Validate token and get user info when component mounts
  useEffect(() => {
    const validateTokenAndGetUserInfo = async () => {
      if (!userId || !token) {
        setTokenValid(false);
        setError('Invalid URL. Please use the link provided in your email.');
        return;
      }

      try {
        // Validate token and get user info
        const response = await axiosInstance.get(`/users/${userId}/validate-token/${token}`);
        setUserInfo(response.data.user);
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('Your link has expired or is invalid. Please contact HR for assistance.');
      }
    };

    validateTokenAndGetUserInfo();
  }, [userId, token]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setUploadStatus(null);

    // Create form data object
    const data = new FormData();
    data.append('file', selectedFile);
    
    // Append other form fields to the FormData
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      // Use the URL with userId and token for the upload
      const uploadUrl = userId && token 
        ? `/incidentreport/upload/${userId}/${token}` 
        : '/incidentreport/upload';
        
      // Make API request to upload the file
      const response = await axiosInstance.post(uploadUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      setUploadStatus({
        success: true,
        message: 'Report uploaded successfully! You may now close this window.',
        data: response.data
      });
      
      // Reset form after successful upload
      setSelectedFile(null);
      setFormData({
        title: 'Absence Explanation Report',
        description: '',
        location: '',
        severity: 'Medium'
      });
      
      // Reset file input
      document.getElementById('file-upload').value = '';
      
      // After 5 seconds, redirect to a thank you page or just show the confirmation
      setTimeout(() => {
        if (userId && token) {
          // If we're in token mode, we can just show the success message
          // Or redirect to a specific thank you page
          // navigate('/incident-report-thank-you');
        }
      }, 5000);
    } catch (error) {
      console.error('Error uploading file:', error);
      
      setUploadStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      });
      
      setError(error.response?.data?.message || 'Failed to upload the incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If token is invalid, show error message
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Invalid Link</h1>
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
          <p className="text-center mt-4">
            Please contact your HR department for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Incident Report Upload</h1>
        
        {userInfo && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800">User Information</h2>
            <p className="mt-2 text-gray-700">Name: {userInfo.name}</p>
            <p className="text-gray-700">Email: {userInfo.email}</p>
            <p className="text-gray-700">Department: {userInfo.department}</p>
          </div>
        )}
        
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800">Attendance Notice</h2>
          <p className="mt-2 text-gray-700">
            Our records indicate you have exceeded the maximum allowed absences for this month.
            Please submit an explanation with any supporting documentation.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {uploadStatus?.success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {uploadStatus.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Report Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter report title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Explanation of Absences
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please explain the reason for your absences this month"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Work Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your work location or department"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Impact Level
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low Impact</option>
              <option value="Medium">Medium Impact</option>
              <option value="High">High Impact</option>
              <option value="Critical">Critical Impact</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Supporting Document
            </label>
            <input 
              id="file-upload"
              type="file" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
              required
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-700">
                Selected File: <span className="font-medium">{selectedFile.name}</span> ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Accepted file formats: PDF, Word, Excel, images, and text documents (Max: 10MB)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white 
              ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150`}
          >
            {loading ? 'Uploading...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}