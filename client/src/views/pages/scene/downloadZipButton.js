// client/components/DownloadZipButton.jsx
import React from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const DownloadZipButton = () => {
  const handleDownload = async () => {
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    try {
      const response = await axiosInstance.post(
        '/management/downloadZip',
        { name, role, username },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'protected.zip';
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <button onClick={handleDownload}>
      Download Protected Zip
    </button>
  );
};

export default DownloadZipButton;
