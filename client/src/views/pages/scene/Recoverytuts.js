import React, { useState } from "react";
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
  CPaginationItem
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
  cilChevronRight
} from '@coreui/icons';

const AccessReview = () => {
  const { data, error, isLoading } = useGetPermissionsQuery(); // RTK Query hook
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of users to display per page

  // Get role-specific badge color
  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Get department-specific icon
  const getDepartmentIcon = (department) => {
    switch(department?.toLowerCase()) {
      case 'it':
        return cilShieldAlt;
      case 'hr':
        return cilPeople;
      case 'finance':
        return cilBriefcase;
      case 'marketing':
        return cilSearch;
      default:
        return cilBuilding;
    }
  };

  // Render permissions with colored badges based on sensitivity
  const renderPermission = (permission) => {
    let color = 'info';
    if (permission.includes('delete') || permission.includes('admin')) {
      color = 'danger';
    } else if (permission.includes('edit') || permission.includes('create') || permission.includes('write')) {
      color = 'warning';
    } else if (permission.includes('view') || permission.includes('read')) {
      color = 'success';
    }
    
    return (
      <CBadge color={color} className="me-1 mb-1">
        {permission}
      </CBadge>
    );
  };

  if (isLoading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  if (error) {
    return (
      <CContainer className="mt-4">
        <CAlert color="danger">Error: {error.message}</CAlert>
      </CContainer>
    );
  }

  // Calculate pagination values
  const totalUsers = data?.users?.length || 0;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = data?.users?.slice(indexOfFirstUser, indexOfLastUser) || [];

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <CPaginationItem 
        key="prev" 
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <CIcon icon={cilChevronLeft} />
      </CPaginationItem>
    );
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <CPaginationItem 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </CPaginationItem>
      );
    }
    
    // Next button
    items.push(
      <CPaginationItem 
        key="next" 
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <CIcon icon={cilChevronRight} />
      </CPaginationItem>
    );
    
    return items;
  };

  return (
    <CContainer className="mt-4">
      <CCard className="mb-4 shadow-sm">
        <CCardHeader className="bg-primary text-white d-flex align-items-center">
          <CIcon icon={cilLockLocked} size="xl" className="me-2" />
          <h3 className="mb-0">Access Control Review</h3>
        </CCardHeader>
        <CCardBody>
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
                  {renderPaginationItems()}
                </CPagination>
              </div>
            </>
          ) : (
            <CAlert color="info">No users found</CAlert>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default AccessReview;