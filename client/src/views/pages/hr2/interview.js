import React, { useState } from 'react';
import axios from 'axios';

const InterviewScheduler = () => {
  const [interviewDetails, setInterviewDetails] = useState({ candidate: '', interviewer: '', date: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInterviewDetails({ ...interviewDetails, [name]: value });
  };

  const scheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr2/interview', interviewDetails);
      alert('Interview scheduled successfully');
    } catch (err) {
      console.error('Error scheduling interview:', err);
    }
  };

  return (
    <div>
      <h2>Schedule Interview</h2>
      <form onSubmit={scheduleInterview}>
        <input name="candidate" placeholder="Candidate ID" onChange={handleInputChange} />
        <input name="interviewer" placeholder="Interviewer" onChange={handleInputChange} />
        <input name="date" type="datetime-local" onChange={handleInputChange} />
        <button type="submit">Schedule</button>
      </form>
    </div>
  );
};

export default InterviewScheduler;
