import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const Complains = () => {
    const [complaints, setComplaints] = useState([]);

    useEffect(() => {
        fetchComplains();
    }, []);

    const fetchComplains = async () => {
        try {
            const response = await axiosInstance.get('/complains/get-complains');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        }
    };

    const resolveComplaintWithAI = async (complaint) => {
        try {
            const aiResponse = await axiosInstance.post('/complains/ai-resolve', {
                complaintText: complaint.complaintText,
                complaintId: complaint._id
            });
            console.log('AI resolved:', aiResponse.data);
            fetchComplains(); // Refresh
        } catch (error) {
            console.error('Error resolving with AI:', error);
        }
    };

    useEffect(() => {
        complaints.forEach(c => {
            if (c.status === 'Pending') {
                resolveComplaintWithAI(c);
            }
        });
    }, [complaints]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Complaints</h1>
            {complaints.map((c) => (
                <div key={c._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                    <p><strong>User:</strong> {c.userId}</p>
                    <p><strong>Complaint:</strong> {c.complaintText}</p>
                    <p><strong>Status:</strong> {c.status}</p>
                    {c.resolutionText && <p><strong>AI Resolution:</strong> {c.resolutionText}</p>}
                </div>
            ))}
        </div>
    );
};

export default Complains;
