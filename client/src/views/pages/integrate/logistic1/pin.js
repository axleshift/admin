import React, { useState } from 'react';
import { useGetLogisticsByTrackingNumQuery, useGetLogisticsQuery } from '../../../../state/adminApi'; // Adjust the import path as necessary
import axios from 'axios'; // Ensure axios is imported

const Pin = () => {
    const [trackingNum, setTrackingNum] = useState('');
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [email, setEmail] = useState(''); // State for the email input
    const [message, setMessage] = useState(''); // State for success/error message

    // Fetch all logistics to populate tracking numbers
    const { data: logisticsData, error: logisticsError, isLoading: logisticsLoading } = useGetLogisticsQuery();

    // Use the RTK Query hook to fetch logistics by tracking number
    const { data: logistics, error, isLoading } = useGetLogisticsByTrackingNumQuery(trackingNum, {
        skip: !searchTriggered || !trackingNum, // Skip the query if search hasn't been triggered or trackingNum is empty
    });

    const handleSearch = () => {
        setSearchTriggered(true);
    };

    const handleSendEmail = () => {
        // Replace this with actual email sending logic
        if (logistics && email) {
            // Send email via API
            axios.post('http://localhost:5053/logix/send-logistics-email', { email, currentLocation: logistics.currentLocation })
                .then((res) => {
                    if (res.data.message === 'Email sent successfully') {
                        setMessage('Email sent successfully! Check your inbox.');
                    } else {
                        setMessage('Failed to send email. Please try again.');
                    }
                })
                .catch((err) => {
                    setMessage('An error occurred while sending the email.');
                    console.error(err); // Use console.error for better error visibility
                });

            // Clear the email input after sending
            setEmail('');
        } else {
            setMessage('Please select a tracking number and enter your email.');
        }
    };

    return (
        <div>
            <h2>Track Your Logistics</h2>

            {/* Dropdown for selecting tracking number */}
            {logisticsLoading && <p>Loading tracking numbers...</p>}
            {logisticsError && <p>Error fetching logistics: {logisticsError.message}</p>}
            {logisticsData && (
                <select 
                    value={trackingNum} 
                    onChange={(e) => setTrackingNum(e.target.value)} 
                    placeholder="Select Tracking Number"
                >
                    <option value="">Select Tracking Number</option>
                    {logisticsData.map((logistic) => (
                        <option key={logistic.trackingNumber} value={logistic.trackingNumber}>
                            {logistic.trackingNumber}
                        </option>
                    ))}
                </select>
            )}
            
            <button onClick={handleSearch} disabled={!trackingNum}>Search</button>

            {isLoading && <p>Loading logistics data...</p>}
            {error && <p>Error fetching logistics: {error.message}</p>}
            
            {logistics && (
                <div>
                    <h3>Current Location:</h3>
                    <p>{logistics.currentLocation || "Location not available"}</p>

                    {/* Email input and send button */}
                    <div>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email" 
                        />
                        <button onClick={handleSendEmail} disabled={!email}>
                            Send Location
                        </button>
                    </div>

                    {message && <p>{message}</p>} {/* Display success/error message */}
                </div>
            )}
        </div>
    );
};

export default Pin;
