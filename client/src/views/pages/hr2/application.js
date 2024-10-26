import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobApplications = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get('/api/hr2/candidates');
        setCandidates(response.data);
      } catch (err) {
        console.error('Error fetching candidates:', err);
      }
    };

    fetchCandidates();
  }, []);

  return (
    <div>
      <h2>Job Applications</h2>
      <ul>
        {candidates.map(candidate => (
          <li key={candidate._id}>
            {candidate.name} - {candidate.appliedPosition.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobApplications;
