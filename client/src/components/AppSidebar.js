import React, { useEffect, useState } from 'react';
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

// sidebar nav config
import navigation from '../_nav';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.changeState.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow);

  // Initialize role from Redux state or sessionStorage
  const reduxUserRole = useSelector((state) => state.changeState.auth?.role);
  const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole') || 'guest'); // Start with session or guest

  useEffect(() => {
    // Check if the Redux user role is available, if not, fallback to sessionStorage
    if (reduxUserRole) {
      setUserRole(reduxUserRole); // Update state if Redux role changes
      sessionStorage.setItem('role', reduxUserRole); // Sync with sessionStorage for later use
    } else {
      const sessionRole = sessionStorage.getItem('role'); // Fallback to sessionStorage if Redux is empty
      if (sessionRole) {
        setUserRole(sessionRole); // Set from sessionStorage
      }
    }
  }, [reduxUserRole]);

  // Debugging userRole
  console.log('User Role in Sidebar:', userRole);

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

      {/* Pass userRole to the navigation */}
      <AppSidebarNav items={navigation(userRole)} /> 

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
