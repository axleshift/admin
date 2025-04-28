import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const Complains = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch complaints on component mount only
    useEffect(() => {
        fetchComplains();
    }, []);

    const fetchComplains = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/complains/get-complains');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const resolveComplaintWithAI = async (complaint) => {
        try {
            await axiosInstance.post('/complains/ai-resolve', {
                complaintText: complaint.complaintText,
                complaintId: complaint._id
            });
            
            // Instead of fetching all complaints, update this specific complaint locally
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id 
                        ? {...c, status: 'Processing'} // Mark as processing until next fetch
                        : c
                )
            );
            
            // Optional: Fetch all complaints after a small delay to get the updated data
            setTimeout(fetchComplains, 1000);
        } catch (error) {
            console.error('Error resolving with AI:', error);
        }
    };

    // Manual resolution button handler
    const handleResolveClick = (complaint) => {
        if (complaint.status === 'Pending') {
            resolveComplaintWithAI(complaint);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Complaints Management</h1>
            {loading ? (
                <p>Loading complaints...</p>
            ) : (
                <>
                    <button 
                        onClick={fetchComplains} 
                        style={{ marginBottom: '15px', padding: '8px 12px' }}
                    >
                        Refresh Complaints
                    </button>
                    
                    {complaints.length === 0 ? (
                        <p>No complaints found.</p>
                    ) : (
                        complaints.map((c) => (
                            <div 
                                key={c._id} 
                                style={{ 
                                    border: '1px solid #ccc', 
                                    borderRadius: '4px',
                                    margin: '10px 0', 
                                    padding: '15px',
                                    backgroundColor: c.status === 'Resolved' ? '#f0f7f0' : '#fff'
                                }}
                            >
                                <p><strong>User:</strong> {c.userId}</p>
                                <p><strong>Complaint:</strong> {c.complaintText}</p>
                                <p><strong>Status:</strong> {c.status}</p>
                                {c.resolutionText && (
                                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                                        <p><strong>AI Resolution:</strong> {c.resolutionText}</p>
                                    </div>
                                )}
                                {c.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleResolveClick(c)}
                                        style={{ marginTop: '10px', padding: '5px 10px' }}
                                    >
                                        Resolve with AI
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
};

export default Complains;