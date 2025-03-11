// filepath: c:\Users\ryans\OneDrive\Desktop\withsecurity\admin - Copy\client\src\views\pages\Security\UserManagement.js
import React from 'react';
import { useGetAnomaliesQuery } from '../../../state/adminApi';

const UserManagement = () => {
    const { data: anomalies, error, isLoading } = useGetAnomaliesQuery();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>Anomalies</h1>
            <ul>
                {anomalies.map(anomaly => (
                    <li key={anomaly._id}>
                        {anomaly.userId.name} - {anomaly.reason} - {new Date(anomaly.timestamp).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagement;