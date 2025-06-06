import React, { useState, useEffect } from 'react';
import axiosInstance from './../../../utils/axiosInstance'; 
import { 
  CButton, 
  CForm, 
  CFormLabel, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CAlert,
  CFormSelect,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormInput
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPlay, faTrashAlt, faFlask } from '@fortawesome/free-solid-svg-icons';

const BackupManagerFrontend = () => {
  const [hours, setHours] = useState('02');
  const [minutes, setMinutes] = useState('00');
  const [ampm, setAmPm] = useState('AM');
  const [retentionPeriod, setRetentionPeriod] = useState('6');
  const [testMinutes, setTestMinutes] = useState('5');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/backupauto/config');
        const config = response.data;
        
        if (config.cronSchedule) {
          const cronParts = config.cronSchedule.split(' ');
          const minutes = cronParts[0];
          const hours = cronParts[1];
          
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
        
        // Set retention period if available
        if (config.retentionPeriodMonths) {
          setRetentionPeriod(config.retentionPeriodMonths.toString());
        }
      } catch (error) {
        console.error('Error fetching backup configuration:', error);
        // Don't show error to user, just use defaults
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);

  const hoursOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString().padStart(2, '0'), label: hour.toString().padStart(2, '0') };
  });

  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i;
    return { value: minute.toString().padStart(2, '0'), label: minute.toString().padStart(2, '0') };
  });

  const retentionOptions = [
    { value: '1', label: '1 Month' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '1 Year' },
    { value: '24', label: '2 Years' }
  ];

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
  };

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

  const handleUpdateSchedule = async () => {
    setIsLoading(true);
    try {
      const time24 = convertTo24HourFormat();
      const cronSchedule = `${time24.minutes} ${time24.hours} * * *`;
      
      const response = await axiosInstance.post('/backupauto/update-schedule', { 
        cronSchedule,
        retentionPeriodMonths: parseInt(retentionPeriod, 10)
      });
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error updating schedule: ${error.response?.data || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBackup = async () => {
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

  const handleManualCleanup = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/backupauto/cleanup');
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error during cleanup: ${error.response?.data || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestMinutesRetention = async () => {
    setIsLoading(true);
    try {
      const minutes = parseInt(testMinutes, 10);
      if (isNaN(minutes) || minutes < 1) {
        showFeedback('Please enter a valid number of minutes (at least 1).', 'warning');
        setIsLoading(false);
        return;
      }
      
      const response = await axiosInstance.post('/backupauto/test-minutes-retention', { 
        minutes: minutes 
      });
      showFeedback(response.data, 'success');
    } catch (error) {
      showFeedback(`Error during test: ${error.response?.data || error.message}`, 'danger');
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
          <p className="mb-4">
            Backups are automatically saved to the Downloads/my-backups folder in your home directory.
          </p>

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
                {isLoading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faClock} />} Set Schedule
              </CButton>
            </div>
            <small className="text-muted mt-2 d-block">
              Current schedule: Daily at {hours}:{minutes} {ampm}
            </small>
          </CForm>

          <div className="mb-4">
            <CFormLabel>Backup Retention Period</CFormLabel>
            <div className="d-flex align-items-center">
              <CFormSelect
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                disabled={isLoading}
                style={{ width: '150px' }}
              >
                {retentionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </CFormSelect>
              <small className="text-muted ms-3">
                Backups older than this will be automatically deleted
              </small>
            </div>
          </div>

          <div className="d-flex mt-4">
            <CButton 
              color="danger" 
              onClick={handleManualBackup}
              disabled={isLoading}
              className="me-3"
            >
              {isLoading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faPlay} />} Trigger Backup Now
            </CButton>
            
            <CButton 
              color="warning" 
              onClick={handleManualCleanup}
              disabled={isLoading}
            >
              {isLoading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faTrashAlt} />} Clean Up Old Backups
            </CButton>
          </div>
          
          {/* <div className="mt-4 pt-3 border-top">
            <CFormLabel>Test Backup Retention (Minutes Ago)</CFormLabel>
            <div className="d-flex align-items-center">
              <CInputGroup style={{ width: '200px' }}>
                <CFormInput
                  type="number"
                  value={testMinutes}
                  onChange={(e) => setTestMinutes(e.target.value)}
                  placeholder="Minutes"
                  aria-label="Minutes ago"
                  disabled={isLoading}
                  min="1"
                />
        <CInputGroupText>minutes</CInputGroupText>
              </CInputGroup>
              <CButton 
                color="info" 
                onClick={handleTestMinutesRetention}
                disabled={isLoading}
                className="ms-3"
              >
                {isLoading ? <CSpinner size="sm" /> : <FontAwesomeIcon icon={faFlask} />} Test Retention
              </CButton>
            </div>
            <small className="text-muted mt-1 d-block">
              Creates a test backup dated in the past and attempts to delete it. For testing purposes only.
            </small>
          </div> */}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default BackupManagerFrontend;