import React, { useState, useEffect } from "react";
import {
  CContainer,
  CTable,
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
  CBadge,
  CCardHeader,
  CPagination,
  CPaginationItem,
  CFormSwitch,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CForm,
  CFormCheck,
  CFormTextarea,
  CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from "@coreui/react";
import { useGetPermissionsQuery } from "../../../state/adminApi";
import CIcon from '@coreui/icons-react';
import { 
  cilPeople, 
  cilLockLocked, 
  cilBriefcase, 
  cilBuilding, 
  cilSearch,
  cilShieldAlt,
  cilChevronLeft,
  cilChevronRight,
  cilFilter,
  cilCheckCircle,
  cilHistory,
  cilCalendar,
  cilClock,
  cilNotes
} from '@coreui/icons';
import logActivity from "./../../../utils/activityLogger";
import axiosInstance from "../../../utils/axiosInstance";

const AccessReview = () => {
  const { data, error, isLoading, refetch } = useGetPermissionsQuery(); 
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyWithPermissions, setShowOnlyWithPermissions] = useState(true);
  const [showPendingReviews, setShowPendingReviews] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissionsToRevoke, setPermissionsToRevoke] = useState([]);
  const [reviewNotes, setReviewNotes] = useState("");
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [initiateReviewModal, setInitiateReviewModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const itemsPerPage = 10;
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name');

  // Load current user info
  useEffect(() => {
    try {
      const userString = localStorage.getItem('currentUser');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        logActivity({
          name: userName,
          role: userRole,
          department: userDepartment,
          route: 'admin/access-review',
          action: 'VIEW',
          description: 'Accessed permission review page'
        });
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  }, []);

  // Style and color utilities
  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'user': return 'info';
      default: return 'secondary';
    }
  };

  const getDepartmentIcon = (department) => {
    switch(department?.toLowerCase()) {
      case 'it': return cilShieldAlt;
      case 'hr': return cilPeople;
      case 'finance': return cilBriefcase;
      case 'marketing': return cilSearch;
      default: return cilBuilding;
    }
  };

  const renderPermission = (permission, isReviewMode = false, userId = null) => {
    let color = 'info';
    if (permission.includes('delete') || permission.includes('admin')) {
      color = 'danger';
    } else if (permission.includes('edit') || permission.includes('create') || permission.includes('write')) {
      color = 'warning';
    } else if (permission.includes('view') || permission.includes('read')) {
      color = 'success';
    }
    
    if (isReviewMode) {
      const isRevoked = permissionsToRevoke.includes(permission);
      return (
        <div className="d-flex align-items-center mb-2">
          <CFormCheck 
            id={`${userId}-${permission}`}
            checked={!isRevoked}
            onChange={() => togglePermissionRevocation(permission)}
            className="me-2"
          />
          <CBadge color={isRevoked ? 'secondary' : color} className={isRevoked ? 'text-decoration-line-through' : ''}>
            {permission}
          </CBadge>
        </div>
      );
    }
    
    return (
      <CBadge color={color} className="me-1 mb-1">
        {permission}
      </CBadge>
    );
  };

  const getReviewStatusBadge = (status) => {
    switch(status) {
      case 'Completed':
        return <CBadge color="success">Completed</CBadge>;
      case 'Pending':
        return <CBadge color="warning">Pending Review</CBadge>;
      case 'Overdue':
        return <CBadge color="danger">Overdue</CBadge>;
      default:
        return <CBadge color="secondary">Not Reviewed</CBadge>;
    }
  };

  // Filter users based on criteria
  const filteredUsers = data?.users?.filter(user => {
    // First apply the permissions filter
    if (showOnlyWithPermissions && (!user.permissions || user.permissions.length === 0)) {
      return false;
    }
    
    // Then apply the pending reviews filter if needed
    if (showPendingReviews && user.reviewStatus !== 'Pending') {
      return false;
    }
    
    // Apply department filter if set
    if (filterDepartment && user.department !== filterDepartment) {
      return false;
    }
    
    // Apply role filter if set
    if (filterRole && user.role !== filterRole) {
      return false;
    }
    
    return true;
  }) || [];

  // Pagination logic
  const totalUsers = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser) || [];

  // Modal and review functions
  const openReviewModal = (user) => {
    setSelectedUser(user);
    setPermissionsToRevoke([]);
    setReviewNotes("");
    setReviewModalVisible(true);
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: 'access-review',
      action: 'OPEN_REVIEW',
      description: `Opened access review for user: ${user.name}`
    });
  };

  const openHistoryModal = (user) => {
    setSelectedUser(user);
    setHistoryModalVisible(true);
    
    logActivity({
      name: userName,
      role: userRole,
      department: userDepartment,
      route: 'admin/access-review',
      action: 'VIEW_HISTORY',
      description: `Viewed access review history for user: ${user.name}`
    });
  };

  const togglePermissionRevocation = (permission) => {
    if (permissionsToRevoke.includes(permission)) {
      setPermissionsToRevoke(permissionsToRevoke.filter(p => p !== permission));
    } else {
      setPermissionsToRevoke([...permissionsToRevoke, permission]);
    }
  };

  const submitReview = async () => {
    try {
      const response = await axiosInstance.post('/general/recertify', {
        userId: selectedUser._id,
        approved: selectedUser.permissions.filter(p => !permissionsToRevoke.includes(p)),
        rejected: permissionsToRevoke,
        notes: reviewNotes
      });
      
      // Show success message and close modal
      setAlertMessage({
        type: 'success',
        message: 'User access has been successfully recertified!'
      });
      
      setReviewModalVisible(false);
      refetch(); // Refresh the data
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      setAlertMessage({
        type: 'danger',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    }
  };

  const initiateReview = async () => {
    try {
      const response = await axiosInstance.post('/general/initiate-review', {}, {
        params: {
          department: filterDepartment || undefined,
          role: filterRole || undefined
        }
      });
      
      setAlertMessage({
        type: 'success',
        message: `Access review initiated for ${response.data.usersAffected} users`
      });
      
      setInitiateReviewModal(false);
      refetch(); // Refresh the data
      
    } catch (error) {
      console.error('Failed to initiate review:', error);
      setAlertMessage({
        type: 'danger',
        message: `Error: ${error.response?.data?.message || error.message}`
      });
    }
  };

  // Get unique departments and roles for filters
  const departments = data?.users ? [...new Set(data.users.map(user => user.department))].filter(Boolean) : [];
  const roles = data?.users ? [...new Set(data.users.map(user => user.role))].filter(Boolean) : [];

  if (isLoading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  if (error) {
    if (currentUser) {
      logActivity({
        name: currentUser.name || 'Unknown User',
        role: currentUser.role || 'Unknown Role',
        department: currentUser.department || 'Unknown Department',
        route: 'admin/access-review',
        action: 'ERROR',
        description: `Error loading permissions: ${error.message}`
      });
    }

    return (
      <CContainer className="mt-4">
        <CAlert color="danger">Error: {error.message}</CAlert>
      </CContainer>
    );
  }

  return (
    <CContainer className="mt-4">
      {alertMessage && (
        <CAlert color={alertMessage.type} dismissible onClose={() => setAlertMessage(null)}>
          {alertMessage.message}
        </CAlert>
      )}
      
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="bg-primary text-white d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <CIcon icon={cilLockLocked} size="xl" className="me-2" />
            <h3 className="mb-0">Access Control Review</h3>
          </div>
          <CButton 
            color="light" 
            onClick={() => setInitiateReviewModal(true)}
          >
            <CIcon icon={cilCalendar} className="me-2" />
            Initiate Review
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* Filter Controls */}
          <div className="mb-4 p-3 bg-light rounded">
            <div className="d-flex flex-wrap align-items-center">
              <div className="me-4 mb-2">
                <CFormSwitch 
                  id="permissionFilter" 
                  label="Show only users with permissions" 
                  checked={showOnlyWithPermissions}
                  onChange={() => {
                    setShowOnlyWithPermissions(!showOnlyWithPermissions);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="me-4 mb-2">
                <CFormSwitch 
                  id="pendingReviewFilter" 
                  label="Show only pending reviews" 
                  checked={showPendingReviews}
                  onChange={() => {
                    setShowPendingReviews(!showPendingReviews);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="me-3 mb-2">
                <CFormSelect
                  id="departmentFilter"
                  size="sm"
                  value={filterDepartment}
                  onChange={(e) => {
                    setFilterDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </CFormSelect>
              </div>
              
              <div className="mb-2">
                <CFormSelect
                  id="roleFilter"
                  size="sm"
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </CFormSelect>
              </div>
            </div>
          </div>

          {totalUsers > 0 ? (
            <>
              <CTable hover responsive striped className="border">
                <thead className="bg-light">
                  <tr>
                    <th>
                      <CIcon icon={cilPeople} className="me-2" />
                      Name
                    </th>
                    <th>
                      <CIcon icon={cilBriefcase} className="me-2" />
                      Role
                    </th>
                    <th>
                      <CIcon icon={cilBuilding} className="me-2" />
                      Department
                    </th>
                    <th>
                      <CIcon icon={cilShieldAlt} className="me-2" />
                      Permissions
                    </th>
                    <th>
                      <CIcon icon={cilClock} className="me-2" />
                      Review Status
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="align-middle font-weight-bold">{user.name}</td>
                      <td className="align-middle">
                        <CBadge color={getRoleBadgeColor(user.role)}>{user.role}</CBadge>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <CIcon icon={getDepartmentIcon(user.department)} className="me-2" />
                          {user.department}
                        </div>
                      </td>
                      <td>
                        <CCard className="border-0 shadow-sm">
                          <CCardBody className="p-3">
                            <div className="d-flex flex-wrap">
                              {user.permissions && user.permissions.length > 0 ? (
                                user.permissions.map((perm, index) => (
                                  <div key={index} className="me-1 mb-1">
                                    {renderPermission(perm)}
                                  </div>
                                ))
                              ) : (
                                <CBadge color="secondary" className="text-muted">
                                  No permissions assigned
                                </CBadge>
                              )}
                            </div>
                          </CCardBody>
                        </CCard>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex flex-column">
                          {getReviewStatusBadge(user.reviewStatus)}
                          {user.lastReviewDate && (
                            <small className="text-muted mt-1">
                              Last review: {new Date(user.lastReviewDate).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <CButton 
                          color="primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => openReviewModal(user)}
                        >
                          <CIcon icon={cilCheckCircle} className="me-1" />
                          Review
                        </CButton>
                        <CButton 
                          color="secondary" 
                          size="sm"
                          onClick={() => openHistoryModal(user)}
                        >
                          <CIcon icon={cilHistory} className="me-1" />
                          History
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </CTable>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalUsers)} of {totalUsers} users
                </div>
                <CPagination aria-label="Page navigation">
                  <CPaginationItem 
                    key="prev" 
                    disabled={currentPage === 1}
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  >
                    <CIcon icon={cilChevronLeft} />
                  </CPaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <CPaginationItem 
                      key={page} 
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}
                  
                  <CPaginationItem 
                    key="next" 
                    disabled={currentPage === totalPages}
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  >
                    <CIcon icon={cilChevronRight} />
                  </CPaginationItem>
                </CPagination>
              </div>
            </>
          ) : (
            <CAlert color="info">
              No users match the current filter criteria
            </CAlert>
          )}
        </CCardBody>
      </CCard>

      {/* Review Modal */}
      <CModal 
        visible={reviewModalVisible} 
        onClose={() => setReviewModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Access Review for {selectedUser?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUser && (
            <>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <strong className="me-2">Role:</strong>
                  <CBadge color={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</CBadge>
                </div>
                <div className="d-flex align-items-center">
                  <strong className="me-2">Department:</strong>
                  <span>
                    <CIcon icon={getDepartmentIcon(selectedUser.department)} className="me-1" />
                    {selectedUser.department}
                  </span>
                </div>
              </div>
              
              <CCard className="mb-3">
                <CCardHeader>
                  <strong>Review Permissions</strong>
                  <div className="text-muted small">Uncheck permissions that should be revoked</div>
                </CCardHeader>
                <CCardBody>
                  {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                    <div className="row">
                      {selectedUser.permissions.map((permission, index) => (
                        <div key={index} className="col-md-6 mb-2">
                          {renderPermission(permission, true, selectedUser._id)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CAlert color="info">User has no permissions to review</CAlert>
                  )}
                </CCardBody>
              </CCard>
              
              <CForm>
                <div className="mb-3">
                  <label htmlFor="reviewNotes" className="form-label">
                    <CIcon icon={cilNotes} className="me-1" />
                    Review Notes
                  </label>
                  <CFormTextarea
                    id="reviewNotes"
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this review (optional)"
                  />
                </div>
              </CForm>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setReviewModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={submitReview}>
            <CIcon icon={cilCheckCircle} className="me-1" />
            Complete Review
          </CButton>
        </CModalFooter>
      </CModal>

      {/* History Modal */}
      <CModal 
        visible={historyModalVisible} 
        onClose={() => setHistoryModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Access Review History for {selectedUser?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedUser && (
            <>
              {selectedUser.reviewHistory && selectedUser.reviewHistory.length > 0 ? (
                <CListGroup>
                  {selectedUser.reviewHistory.map((review, index) => (
                    <CListGroupItem key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Reviewed by:</strong> {review.reviewerName}
                        </div>
                        <CBadge color="info">
                          {new Date(review.date).toLocaleDateString()} at {new Date(review.date).toLocaleTimeString()}
                        </CBadge>
                      </div>
                      
                      {review.notes && (
                        <div className="mb-2">
                          <strong>Notes:</strong> {review.notes}
                        </div>
                      )}
                      
                      {review.rejectedPermissions && review.rejectedPermissions.length > 0 && (
                        <div className="mb-2">
                          <strong>Revoked Permissions:</strong>
                          <div className="mt-1">
                            {review.rejectedPermissions.map((perm, i) => (
                              <CBadge key={i} color="danger" className="me-1 mb-1">
                                {perm}
                              </CBadge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : (
                <CAlert color="info">No review history available for this user</CAlert>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setHistoryModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Initiate Review Modal */}
      <CModal 
        visible={initiateReviewModal} 
        onClose={() => setInitiateReviewModal(false)}
      >
        <CModalHeader>
          <CModalTitle>Initiate Access Review</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Select criteria for the access review. Leave blank to include all users.</p>
          
          <CForm>
            <div className="mb-3">
              <label htmlFor="reviewDepartment" className="form-label">Department</label>
              <CFormSelect
                id="reviewDepartment"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </CFormSelect>
            </div>
            
            <div className="mb-3">
              <label htmlFor="reviewRole" className="form-label">Role</label>
              <CFormSelect
                id="reviewRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </CFormSelect>
            </div>
          </CForm>
          
          <CAlert color="info">
          This will mark users as requiring review and set their review status to &apos;Pending&apos;.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setInitiateReviewModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={initiateReview}>
            Initiate Review
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default AccessReview;