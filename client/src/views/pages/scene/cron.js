import React, { useState, useEffect } from 'react';
import axiosInstance from './../../../utils/axiosInstance'; // Using the custom axios instance
import { 
  CButton, 
  CForm, 
  CFormInput, 
  CFormLabel, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CAlert,
  CFormSelect
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faClock, faPlay } from '@fortawesome/free-solid-svg-icons';

const BackupManagerFrontend = () => {
  const [backupDir, setBackupDir] = useState('');
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('00');
  const [ampm, setAmPm] = useState('AM');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Clear feedback message after 5 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Fetch saved configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/backupauto/config');
        const config = response.data;
        
        // Set backup directory
        if (config.backupDir) {
          setBackupDir(config.backupDir);
        }
        
        // Parse cron schedule to get hours and minutes
        if (config.cronSchedule) {
          // Cron format: minutes hours * * *
          const cronParts = config.cronSchedule.split(' ');
          const minutes = cronParts[0];
          const hours = cronParts[1];
          
          // Convert 24-hour format to 12-hour format
          let hour = parseInt(hours, 10);
          let period = 'AM';
          
          if (hour >= 12) {
            period = 'PM';
            hour = hour === 12 ? 12 : hour - 12;
          }
          hour = hour === 0 ? 12 : hour;
          
          setHours(hour.toString().padStart(2, '0'));
          setMinutes(minutes.padStart(2, '0'));
          setAmPm(period);
        }
      } catch (error) {
        console.error('Error fetching backup configuration:', error);
        showFeedback('Failed to load saved configuration', 'danger');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);

  // Generate hours options (1-12)
  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString().padStart(2, '0'), label: hour.toString().padStart(2, '0') };
  });

  // Generate minutes options (00-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i;
    return { value: minute.toString().padStart(2, '0'), label: minute.toString().padStart(2, '0') };
  });

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
  };

  // Convert 12-hour format to 24-hour for cron
  const convertTo24HourFormat = () => {
    let hour = parseInt(hours, 10);
    
    if (ampm === 'PM' && hour < 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return { 
      hours: hour.toString().padStart(2, '0'), 
      minutes: minutes
    };
  };

  const handleUpdateDirectory = async () => {
    if (!backupDir.trim()) {
      showFeedback('Please enter a valid backup directory path', 'danger');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/backupauto/update-directory', { backupDir });
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error updating directory: ${error.response?.data || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    setIsLoading(true);
    try {
      // Convert to 24-hour format for cron
      const time24 = convertTo24HourFormat();
      
      // Create cron schedule - minutes hours * * *
      const cronSchedule = `${time24.minutes} ${time24.hours} * * *`;
      
      const response = await axiosInstance.post('/backupauto/update-schedule', { cronSchedule });
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error updating schedule: ${error.response?.data || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBackup = async () => {
    if (!backupDir.trim()) {
      showFeedback('Please configure a backup directory first', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/backupauto/backup');
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error triggering backup: ${error.response?.data || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl mb-4">Backup Manager</h2>
      
      {feedback.message && (
        <CAlert color={feedback.type} className="mb-4">
          {feedback.message}
        </CAlert>
      )}
      
      <CCard className="mb-4">
        <CCardHeader>
          <div>Backup Configuration</div>
        </CCardHeader>
        <CCardBody>
          <CForm className="mb-4">
            <CFormLabel>Backup Directory</CFormLabel>
            <div className="d-flex">
              <CFormInput
                type="text"
                value={backupDir}
                onChange={(e) => setBackupDir(e.target.value)}
                placeholder="Enter backup directory path"
                disabled={isLoading}
              />
              <CButton 
                color="primary" 
                onClick={handleUpdateDirectory} 
                className="ms-2"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faFolderOpen} /> Set Directory
              </CButton>
            </div>
          </CForm>

          <CForm className="mb-4">
            <CFormLabel>Backup Time</CFormLabel>
            <div className="d-flex align-items-center">
              <div className="d-flex" style={{ width: '220px' }}>
                <CFormSelect
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  disabled={isLoading}
                  className="me-1"
                  style={{ width: '70px' }}
                >
                  {hoursOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </CFormSelect>
                <span className="mx-1 mt-2">:</span>
                <CFormSelect
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  disabled={isLoading}
                  className="me-1" 
                  style={{ width: '70px' }}
                >
                  {minutesOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </CFormSelect>
                <CFormSelect
                  value={ampm}
                  onChange={(e) => setAmPm(e.target.value)}
                  disabled={isLoading}
                  style={{ width: '70px' }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </CFormSelect>
              </div>
              <CButton 
                color="success" 
                onClick={handleUpdateSchedule} 
                className="ms-3"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faClock} /> Set Schedule
              </CButton>
            </div>
            <small className="text-muted mt-2 d-block">
              Current schedule: Daily at {hours}:{minutes} {ampm}
            </small>
          </CForm>

          <CButton 
            color="danger" 
            onClick={handleManualBackup}
            disabled={isLoading}
            className="mt-3"
          >
            <FontAwesomeIcon icon={faPlay} /> Trigger Backup Now
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default BackupManagerFrontend;