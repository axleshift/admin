import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CSidebar, 
  CSidebarNav, 
  CSidebarToggler,
  CSidebarHeader, 
  CSidebarBrand,  
  CCloseButton,   
  CImage     } from '@coreui/react';
import { AppSidebarNav } from './AppSidebarNav';
import navigation from '../_nav';
import logo from '../../public/img/admin.png'
import icon from '../../public/favicon.ico'
const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.changeState.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow);
  
  const [userRole, setUserRole] = useState('guest');
  const [userDepartment, setUserDepartment] = useState('none');
  const [isReady, setIsReady] = useState(false);
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    const userId = sessionStorage.getItem('userid');
    const role = sessionStorage.getItem('role');
    const department = sessionStorage.getItem('department');

    if (userId) {
      setUserRole(role || 'guest');
      setUserDepartment(department || 'none');
      setNavItems(navigation(role || 'guest', department || 'none'));
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <CSidebar
      position="fixed"
      colorScheme="dark"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible });
      }}
    >
        <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          {/* Reference assets from the public directory using relative URLs */}
          <CImage fluid src="/img/admin.png" alt="Logo" height={30} className="sidebar-brand-full" />
          <CImage src="/favicon.ico" alt="Icon" height={30} className="sidebar-brand-narrow" />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <CSidebarNav>
        <AppSidebarNav items={navItems} />
      </CSidebarNav>
      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  );
};

export default AppSidebar;