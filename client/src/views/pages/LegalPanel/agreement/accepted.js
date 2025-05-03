import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser } from '@fortawesome/free-solid-svg-icons';

// CoreUI
import { CIcon } from '@coreui/icons-react';
import { cilCheckCircle, cilXCircle } from '@coreui/icons';

const AgreementList = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const response = await axiosInstance.get('/agreement/getAgree');
        setAgreements(response.data);
      } catch (err) {
        setError('Failed to load agreements');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  if (loading) return <p><FontAwesomeIcon icon={faClock} /> Loading agreements...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2><FontAwesomeIcon icon={faUser} /> Agreement List</h2>
      {agreements.length === 0 ? (
        <p>No agreements found.</p>
      ) : (
        <ul>
          {agreements.map((agreement) => (
            <li key={agreement._id} style={{ marginBottom: '15px' }}>
              <p>
                <strong>Status:</strong>{' '}
                {agreement.status === 'accepted' ? (
                  <span style={{ color: 'green' }}>
                    <CIcon icon={cilCheckCircle} /> Accepted
                  </span>
                ) : (
                  <span style={{ color: 'red' }}>
                    <CIcon icon={cilXCircle} /> Rejected
                  </span>
                )}
              </p>
              <p>
                <FontAwesomeIcon icon={faUser} /> <strong>User ID:</strong> {agreement.userId}
              </p>
              <p>
                <FontAwesomeIcon icon={faClock} />{' '}
                <strong>Timestamp:</strong>{' '}
                {new Date(agreement.timestamp).toLocaleString()}
              </p>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgreementList;
