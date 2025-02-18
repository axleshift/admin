import React, { useEffect, useState } from "react";
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CAvatar,
  CListGroup,
  CListGroupItem,
  CCol,
  CButton,
  CSpinner,
  CRow,
  CBadge,
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecordVinyl } from "@fortawesome/free-solid-svg-icons";
import "../../../scss/profile.scss";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    department: "",
    permissions: [],
  });
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [ShowActivityLayout, setShowActivityLayout] = useState(true);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve user data and permissions from sessionStorage
    const permissions = sessionStorage.getItem("permissions");
    const userData = {
      name: sessionStorage.getItem("name") || "Unknown Name",
      username: sessionStorage.getItem("username") || "Unknown Username",
      email: sessionStorage.getItem("email") || "Unknown Email",
      role: sessionStorage.getItem("role") || "Unknown Role",
      department: sessionStorage.getItem("department") || "Unknown Department",
      permissions: permissions ? JSON.parse(permissions) : [],
    };
    setUser(userData);
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.error("❌ No userId found in sessionStorage");
      return;
    }

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5053/hr/user/permissions/${userId}`
        );
        console.log("✅ API Response:", response.data);

        if (response.data.permissions && response.data.permissions.length > 0) {
          setAllowedRoutes(response.data.permissions);
        } else {
          console.warn("⚠️ No permissions found for this user.");
        }
      } catch (error) {
        console.error("❌ Error fetching permissions:", error);
      }
    };

    fetchUserPermissions();
  }, []);

  const allPermissions = [...new Set([...user.permissions, ...allowedRoutes])];

  // Function to filter and format activity logs
  const formatActivityLog = (log) => {
    // Skip logs that contain API endpoints or technical descriptions
    if (
      log.action?.includes('/logs/activity') ||
      log.action?.includes('/user-activity') ||
      log.description?.includes('performed POST on') ||
      log.description?.includes('performed GET on')
    ) {
      return null;
    }

    return {
      ...log,
      action: log.action?.replace(/^(POST|GET|PUT|DELETE)\s/, '').replace(/^\/api\//, ''),
      description: log.description?.replace(/User performed \w+ on /, '')
    };
  };

  const fetchUserActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5053/try/user-activity", {
        withCredentials: true,
      });

      // Filter and transform the activity logs
      const filteredActivity = (response.data || [])
        .map(formatActivityLog)
        .filter(log => log !== null);

      setUserActivity(filteredActivity);
      setShowActivityLayout(true);
    } catch (err) {
      console.error("Error fetching user activity:", err);
      setError("Failed to load activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <CRow className="profile-row">
        {/* Profile Section */}
        <CCol lg={isBoxVisible ? 6 : 12} md={12} className="mb-4">
          <CCard className="profile-card h-100">
            <CCardHeader className="profile-header">
              <div className="d-flex justify-content-end">
                <CButton
                  color="primary"
                  variant="ghost"
                  className="activity-toggle-btn"
                  onClick={() => {
                    setIsBoxVisible(!isBoxVisible);
                    fetchUserActivity();
                  }}
                >
                  <FontAwesomeIcon icon={faRecordVinyl} />
                </CButton>
              </div>
              <div className="text-center profile-avatar-section">
                <CAvatar
                  color="primary"
                  textColor="white"
                  size="xl"
                  className="profile-avatar mb-3"
                >
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </CAvatar>
                <h2 className="mb-1">{user.name}</h2>
                <p className="text-medium-emphasis">@{user.username}</p>
              </div>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush className="user-details">
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <strong>Email:</strong>
                  <span className="text-medium-emphasis">{user.email}</span>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <strong>Role:</strong>
                  <span className="text-medium-emphasis">{user.role}</span>
                </CListGroupItem>
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <strong>Department:</strong>
                  <span className="text-medium-emphasis">{user.department}</span>
                </CListGroupItem>
              </CListGroup>

              <div className="permissions-section mt-4">
                <h4 className="mb-3">Permissions</h4>
                {allPermissions.length > 0 ? (
                  <CListGroup>
                    {allPermissions.map((permission, index) => (
                      <CListGroupItem
                        key={`permission-${index}`}
                        className="permission-item"
                      >
                        <CBadge color="light" className="permission-badge">
                          {permission}
                        </CBadge>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                ) : (
                  <p className="text-medium-emphasis">No permissions assigned</p>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Activity Section */}
        {isBoxVisible && (
          <CCol lg={6} md={12} className="mb-4">
            <CCard className="activity-card h-100">
              <CCardHeader>
                <h4 className="mb-0">Activity Logs</h4>
              </CCardHeader>
              <CCardBody className="activity-body">
                <div className="activity-scroll-container">
                  {loading ? (
                    <div className="text-center p-4">
                      <CSpinner color="primary" />
                    </div>
                  ) : error ? (
                    <div className="error-message">{error}</div>
                  ) : userActivity.length > 0 ? (
                    <CListGroup>
                      {userActivity.map((log, index) => (
                        <CListGroupItem
                          key={`activity-${index}`}
                          className="activity-item mb-3"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <CBadge color="primary" className="activity-badge">
                              {log.action}
                            </CBadge>
                            <small className="text-medium-emphasis">
                              {new Date(log.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <p className="mb-0 activity-description">
                            {log.description}
                          </p>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  ) : (
                    <p className="text-center text-medium-emphasis">
                      No activity logs found
                    </p>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        )}
      </CRow>
    </div>
  );
};

export default Profile;