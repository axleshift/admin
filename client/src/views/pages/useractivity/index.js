import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  CContainer,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
} from '@coreui/react';

const UserActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const logActivity = async () => {
            const clientUrl = window.location.href;
            try {
                await axios.post('http://localhost:5053/general/log-activity', { url: clientUrl }, { withCredentials: true });
            } catch (error) {
                console.error('Error logging activity', error);
            }
        };

        logActivity();

        const fetchActivities = async () => {
            try {
                const response = await axios.get('http://localhost:5053/general/activity', { withCredentials: true });
                console.log('Fetched activities:', response.data);
                setActivities(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching activities', error);
                setLoading(false);
            }
        };

        fetchActivities();
    }, [location]);

    const handleUserClick = (userId) => {
        setSelectedUserId((prevId) => (prevId === userId ? null : userId));
    };

    const uniqueUserIds = [...new Set(activities.map(activity => activity.userId._id))];

    return (
        <CContainer>
            <CRow>
                <h2>User Activity Log</h2>
                {loading ? (
                    <CSpinner />
                ) : uniqueUserIds.length > 0 ? (
                    uniqueUserIds.map(userId => {
                        const userActivities = activities.filter(activity => activity.userId._id === userId);
                        const userName = userActivities.length > 0 ? userActivities[0].userId.name : 'Unknown User';

                        return (
                            <CCard key={userId} className="mb-3" style={{ cursor: 'pointer' }} onClick={() => handleUserClick(userId)}>
                                <CCardHeader>
                                    <h4>{userName}</h4>
                                </CCardHeader>
                                {selectedUserId === userId && (
                                    <CCardBody>
                                        <CListGroup>
                                            {userActivities.map(activity => (
                                                <CListGroupItem key={activity._id}>
                                                    Route: {activity.route} - Time: {new Date(activity.timestamp).toLocaleString()}
                                                </CListGroupItem>
                                            ))}
                                        </CListGroup>
                                    </CCardBody>
                                )}
                            </CCard>
                        );
                    })
                ) : (
                    <CAlert color="info">No activities found.</CAlert>
                )}
            </CRow>
        </CContainer>
    );
};

export default UserActivityLog;
