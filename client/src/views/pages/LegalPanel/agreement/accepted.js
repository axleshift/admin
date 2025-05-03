import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';

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

  if (loading) return <p>Loading agreements...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Agreements</h2>
      {agreements.length === 0 ? (
        <p>No agreements found.</p>
      ) : (
        <ul>
          {agreements.map((agreement) => (
            <li key={agreement._id}>
              <strong>Status:</strong> {agreement.status} <br />
              <strong>User ID:</strong> {agreement.userId} <br />
              <strong>Timestamp:</strong> {new Date(agreement.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgreementList;
