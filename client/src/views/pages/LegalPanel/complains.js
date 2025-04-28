import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const Complains = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch complaints on component mount only
    useEffect(() => {
        fetchComplains();
    }, []);

    const fetchComplains = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/complains/get-complains');
            setComplaints(response.data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setError('Failed to load complaints. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resolveComplaintWithAI = async (complaint) => {
        try {
            setError(null);
            // Update UI immediately to show processing
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id 
                        ? {...c, status: 'Processing'} 
                        : c
                )
            );

            // Make API call with the exact route that matches the backend
            const response = await axiosInstance.post('/complains/ai-resolve', {
                complaintText: complaint.complaintText,
                complaintId: complaint._id
            });
            
            // Update the complaint with the response data
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id 
                        ? response.data
                        : c
                )
            );
        } catch (error) {
            console.error('Error resolving with AI:', error);
            setError('Failed to resolve complaint. Please try again.');
            // Revert the complaint status on error
            setComplaints(prevComplaints => 
                prevComplaints.map(c => 
                    c._id === complaint._id 
                        ? {...c, status: 'Pending'}
                        : c
                )
            );
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
            
            {error && (
                <div style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffecec', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
            
            <button 
                onClick={fetchComplains} 
                disabled={loading}
                style={{ 
                    marginBottom: '15px', 
                    padding: '8px 12px',
                    backgroundColor: loading ? '#cccccc' : '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Loading...' : 'Refresh Complaints'}
            </button>
            
            {loading ? (
                <p>Loading complaints...</p>
            ) : (
                <>
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
                                    backgroundColor: c.status === 'Resolved' ? '#f0f7f0' : 
                                                    c.status === 'Processing' ? '#fff8e1' : '#fff'
                                }}
                            >
                                <p><strong>User:</strong> {c.userId}</p>
                                <p><strong>Complaint:</strong> {c.complaintText}</p>
                                <p>
                                    <strong>Status:</strong> 
                                    <span style={{ 
                                        color: c.status === 'Resolved' ? 'green' : 
                                               c.status === 'Processing' ? 'orange' : 'gray',
                                        fontWeight: 'bold'
                                    }}>
                                        {c.status}
                                    </span>
                                </p>
                                {c.resolutionText && (
                                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                        <p><strong>AI Resolution:</strong> {c.resolutionText}</p>
                                    </div>
                                )}
                                {c.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleResolveClick(c)}
                                        style={{ 
                                            marginTop: '10px', 
                                            padding: '5px 10px',
                                            backgroundColor: '#34a853',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
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