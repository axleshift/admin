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
  CButton,
  CAlert,
} from '@coreui/react';

const UserActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [bookmarkedUsers, setBookmarkedUsers] = useState([]);
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

  const handleDeleteActivities = async (userId) => {
    try {
      await axios.delete(`http://localhost:5053/general/activity/${userId}`, { withCredentials: true });
      const updatedActivities = activities.filter(activity => activity.userId?._id !== userId);
      setActivities(updatedActivities);
      setSelectedUserId(null);

      const userName = activities.find(activity => activity.userId?._id === userId)?.userId?.name || 'Unknown User';
      setMessage(`User activity logs for ${userName} have been deleted.`);
    } catch (error) {
      console.error('Error deleting activities', error);
      setMessage('Error deleting activity logs.');
    }
  };

  const toggleBookmark = (userId) => {
    setBookmarkedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const uniqueUserIds = [...new Set(activities
    .map(activity => activity.userId ? activity.userId._id : null)
    .filter(id => id !== null))];

  return (
    <CContainer>
      <CRow>
        <h2>User Activity Log</h2>
        {message && (
          <CAlert color={message.startsWith('Error') ? 'danger' : 'success'}>
            {message}
          </CAlert>
        )}
        {loading ? (
          <CSpinner />
        ) : uniqueUserIds.length > 0 ? (
          <>
            <h4>Bookmarks</h4>
            <CListGroup>
              {bookmarkedUsers.map(userId => (
                <CListGroupItem key={userId} onClick={() => handleUserClick(userId)} style={{ cursor: 'pointer' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    display: 'inline-block',
                    backgroundColor: 'black',
                    marginRight: '10px',
                  }} />
                  User ID: {userId} (Click to view)
                </CListGroupItem>
              ))}
            </CListGroup>

            {uniqueUserIds.map(userId => {
              const userActivities = activities
                .filter(activity => activity.userId?._id === userId)
                .filter(activity => activity.route.startsWith("http")); // Filter out entries that do not start with "http"

              const userName = userActivities.length > 0 ? userActivities[0].userId?.name || 'Unknown User' : 'Unknown User';

              return (
                <CCard key={userId} className="mb-3" style={{ cursor: 'pointer' }} onClick={() => handleUserClick(userId)}>
                  <CCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{userName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the card click event
                          toggleBookmark(userId);
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: bookmarkedUsers.includes(userId) ? 'black' : 'transparent',
                          border: '1px solid black',
                          marginRight: '10px',
                          cursor: 'pointer',
                        }}
                      />
                      <CButton color="danger" onClick={(e) => {
                        e.stopPropagation(); // Prevent the card click event
                        handleDeleteActivities(userId);
                      }}>
                        Delete Activity Logs
                      </CButton>
                    </div>
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
            })}
          </>
        ) : (
          <p>No user activities found.</p>
        )}
      </CRow>
    </CContainer>
  );
};

export default UserActivityLog;
