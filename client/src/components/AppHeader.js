import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  useColorModes,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons';

import { AppBreadcrumb } from './index';
import { AppHeaderDropdown } from './header/index';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import socket from '../util/socket';
import Message from '../views/pages/scene/message'; // Import your Message component

const AppHeader = () => {
  const headerRef = useRef();
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow);

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false); // State to toggle Message modal

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0);
    });

    const handleNewNotification = (data) => {
      const newNotification = {
        id: Date.now(),
        message: (
          <>
            <strong>{data?.user?.name || 'A user'}</strong> has registered as{' '}
            {data?.user?.role || 'a user'}
          </>
        ),
      };

      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
      toast(newNotification.message);
    };

    socket.on('newUserRegistered', handleNewNotification);

    return () => {
      socket.off('newUserRegistered', handleNewNotification);
    };
  }, []);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMessageClick = () => {
    setShowMessageModal(true); // Open the Message modal
  };

  return (
    <>
      <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
        <CContainer className="border-bottom px-4" fluid>
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', payload: { sidebarShow: !sidebarShow } })}
            style={{ marginInlineStart: '-14px' }}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>
          <CHeaderNav className="d-none d-md-flex">
            <CNavItem>
              <CNavLink to="/employeedash" as={NavLink}>
                Dashboard
              </CNavLink>
            </CNavItem>
            
          </CHeaderNav>
          <CHeaderNav className="ms-auto">
            <CNavItem>
              <CNavLink onClick={handleBellClick} style={{ cursor: 'pointer' }}>
                <CIcon icon={cilBell} size="lg" />
              </CNavLink>
            </CNavItem>
            <CDropdown placement="bottom-end">
  <CDropdownToggle onClick={() => setShowDropdown(!showDropdown)}>
    <CIcon icon={cilBell} size="lg" />
  </CDropdownToggle>
  {showDropdown && (
    <CDropdownMenu className="mt-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {notifications.length === 0 ? (
        <CDropdownItem>No new notifications</CDropdownItem>
      ) : (
        notifications.map((notification) => (
          <CDropdownItem key={notification.id}>{notification.message}</CDropdownItem>
        ))
      )}
    </CDropdownMenu>
  )}
</CDropdown>
            
            <CNavItem>
              {/* Message Icon */}
              <CNavLink onClick={handleMessageClick} style={{ cursor: 'pointer' }}>
                <CIcon icon={cilEnvelopeOpen} size="lg" />
              </CNavLink>
            </CNavItem>
          </CHeaderNav>
          <CHeaderNav>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                {colorMode === 'dark' ? (
                  <CIcon icon={cilMoon} size="lg" />
                ) : colorMode === 'auto' ? (
                  <CIcon icon={cilContrast} size="lg" />
                ) : (
                  <CIcon icon={cilSun} size="lg" />
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={colorMode === 'light'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('light')}
                >
                  <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'dark'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('dark')}
                >
                  <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'auto'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('auto')}
                >
                  <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <AppHeaderDropdown />
          </CHeaderNav>
        </CContainer>
        <CContainer className="px-4" fluid>
          <AppBreadcrumb />
        </CContainer>
        <ToastContainer position="top-end" autoClose={5000} /> {/* Add ToastContainer */}
      </CHeader>

      {/* Modal for Message */}
      <CModal visible={showMessageModal} onClose={() => setShowMessageModal(false)}>
        <CModalHeader>Messages</CModalHeader>
        <CModalBody>
          <Message />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowMessageModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AppHeader;
