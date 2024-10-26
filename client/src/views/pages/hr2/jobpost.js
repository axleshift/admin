import React, { useState } from 'react';
import axios from 'axios';

const JobPosting = () => {
  const [jobDetails, setJobDetails] = useState({ title: '', department: '', description: '', qualifications: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const submitJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr2/jobs', jobDetails);
      alert('Job posted successfully');
    } catch (err) {
      console.error('Error posting job:', err);
    }
  };

  return (
    <div>
      <h2>Create Job Posting</h2>
      <form onSubmit={submitJob}>
        <input name="title" placeholder="Job Title" onChange={handleInputChange} />
        <input name="department" placeholder="Department" onChange={handleInputChange} />
        <textarea name="description" placeholder="Job Description" onChange={handleInputChange}></textarea>
        <input name="qualifications" placeholder="Qualifications" onChange={handleInputChange} />
        <button type="submit">Post Job</button>
      </form>
    </div>
  );
};

export default JobPosting;
