import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CPagination,
  CPaginationItem,
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecordVinyl } from "@fortawesome/free-solid-svg-icons";
import { useGetUserActivityQuery, useGetUserPermissionsQuery } from '../../../state/adminApi'

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    department: "",
    permissions: [],
  });
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [ShowActivityLayout, setShowActivityLayout] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  // Using RTK Query hooks
  const { 
    data: userActivity = [], 
    isLoading: activityLoading, 
    error: activityError,
    refetch: refetchActivity
  } = useGetUserActivityQuery(undefined, {
    skip: !isBoxVisible,
    // Add credentials to match backend local requirements
    credentials: 'include'
  });

  const { 
    data: permissionsData,
    isLoading: permissionsLoading
  } = useGetUserPermissionsQuery(userId, {
    skip: !userId,
    credentials: 'include'
  });
  
  useEffect(() => {
    // Retrieve user data from localStorage
    const permissions = localStorage.getItem("permissions");
    const userData = {
      name: localStorage.getItem("name") || "Unknown Name",
      username: localStorage.getItem("username") || "Unknown Username",
      email: localStorage.getItem("email") || "Unknown Email",
      role: localStorage.getItem("role") || "Unknown Role",
      department: localStorage.getItem("department") || "Unknown Department",
      permissions: permissions ? JSON.parse(permissions) : [],
    };
    setUser(userData);
  }, []);

  // Combine permissions from both sources
  const allPermissions = [
    ...new Set([
      ...(user.permissions || []),
      ...(permissionsData?.permissions || [])
    ])
  ];

  // Function to filter and format activity logs
  const formatActivityLog = (log) => {
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

  // Filter and transform activity logs
  const filteredActivity = (userActivity || [])
    .map(formatActivityLog)
    .filter(log => log !== null);

  const handleCreateComplaint = () => {
    navigate("/employeescomplains"); // Adjust the path as per your route
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
                  onClick={() => setIsBoxVisible(!isBoxVisible)}
                >
                  <FontAwesomeIcon icon={faRecordVinyl} />
                </CButton>
                <CButton 
                color='success'
                onClick={handleCreateComplaint}>Create A Complaint</CButton>
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
                {permissionsLoading ? (
                  <CSpinner color="primary" size="sm" />
                ) : allPermissions.length > 0 ? (
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
                  {activityLoading ? (
                    <div className="text-center p-4">
                      <CSpinner color="primary" />
                    </div>
                  ) : activityError ? (
                    <div className="error-message">Failed to load activity. Please try again.</div>
                  ) : filteredActivity.length > 0 ? (
                    <>
                      <CListGroup>
                        {filteredActivity
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((log, index) => (
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

                      {Math.ceil(filteredActivity.length / itemsPerPage) > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                          <CPagination aria-label="Activity log pagination">
                            <CPaginationItem
                              aria-label="Previous"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <span aria-hidden="true">&laquo;</span>
                            </CPaginationItem>

                            {(() => {
                              const totalPages = Math.ceil(filteredActivity.length / itemsPerPage);
                              const maxVisiblePages = 5;
                              let pages = [];

                              if (totalPages <= maxVisiblePages) {
                                pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                              } else {
                                pages.push(1);
                                let start = Math.max(currentPage - 1, 2);
                                let end = Math.min(currentPage + 1, totalPages - 1);
                                if (start === 2) end = 4;
                                if (end === totalPages - 1) start = totalPages - 3;
                                if (start > 2) pages.push('...');
                                for (let i = start; i <= end; i++) {
                                  pages.push(i);
                                }
                                if (end < totalPages - 1) pages.push('...');
                                pages.push(totalPages);
                              }

                              return pages.map((page, index) => (
                                page === '...' ? (
                                  <CPaginationItem
                                    key={`ellipsis-${index}`}
                                    disabled
                                  >
                                    ...
                                  </CPaginationItem>
                                ) : (
                                  <CPaginationItem
                                    key={page}
                                    active={currentPage === page}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </CPaginationItem>
                                )
                              ));
                            })()}

                            <CPaginationItem
                              aria-label="Next"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === Math.ceil(filteredActivity.length / itemsPerPage)}
                            >
                              <span aria-hidden="true">&raquo;</span>
                            </CPaginationItem>
                          </CPagination>
                        </div>
                      )}
                    </>
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