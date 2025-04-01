import React, { useEffect, useState } from 'react';
import { getPasswordAnalysis } from '../../../services/userService';

const PasswordAnalysis = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const data = await getPasswordAnalysis();
            setUsers(data);
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Password Security Analysis</h2>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Strength</th>
                            <th>Breach Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} style={{
                                backgroundColor: user.isBreached ? '#ffdddd' : user.strength < 3 ? '#fff3cd' : '#d4edda'
                            }}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.strengthMessage}</td>
                                <td style={{ color: user.isBreached ? 'red' : 'green' }}>
                                    {user.breachMessage}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PasswordAnalysis;
