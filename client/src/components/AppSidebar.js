import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { AppSidebarNav } from './AppSidebarNav';
import { logo } from 'src/assets/brand/logo';
import { sygnet } from 'src/assets/brand/sygnet';
import navigation from '../_nav';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.changeState.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow);

  const reduxUserRole = useSelector((state) => state.changeState.auth?.role);
  const reduxUserDepartment = useSelector((state) => state.changeState.auth?.department);
  
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role') || 'guest');
  const [userDepartment, setUserDepartment] = useState(sessionStorage.getItem('department') || 'none');
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:5053/hr/user/permissions/${userId}`);
        console.log('✅ Permissions from API:', response.data);
        
        setUserPermissions(response.data.accessPermissions || []);

      } catch (error) {
        console.error('❌ Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, []);
  useEffect(() => {
    if (reduxUserRole) {
      setUserRole(reduxUserRole);
      sessionStorage.setItem('role', reduxUserRole);
    }

    if (reduxUserDepartment) {
      setUserDepartment(reduxUserDepartment);
      sessionStorage.setItem('department', reduxUserDepartment);
    }
  }, [reduxUserRole, reduxUserDepartment]);

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* Pass updated userPermissions to navigation */}
      <AppSidebarNav items={navigation(userRole, userDepartment, userPermissions)} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default AppSidebar;
