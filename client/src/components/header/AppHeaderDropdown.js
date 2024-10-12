import React from 'react';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons';
import avatar8 from './../../assets/images/avatars/8.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faGear, faMoneyBill, faRightFromBracket, faTurnUp, faUser } from '@fortawesome/free-solid-svg-icons';

const AppHeaderDropdown = () => {
  // Retrieve the user's name from session storage
  const name = sessionStorage.getItem('name');

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
        <span className="ms-2">{name ? `Welcome, ${name}` : 'Welcome, Guest'}</span>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem href="#">
          <FontAwesomeIcon icon={faTurnUp}/>
          Updates
        </CDropdownItem>
        <CDropdownItem href="#">
          <FontAwesomeIcon icon={faEnvelope}/>
          Messages
        </CDropdownItem>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="/profile">
        <FontAwesomeIcon icon={faUser}/>
          Profile
        </CDropdownItem>
        <CDropdownItem href="/settings">
        <FontAwesomeIcon icon={faGear}/>
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
        <FontAwesomeIcon icon={faMoneyBill}/>
          Payments
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="/login">
        <FontAwesomeIcon icon={faRightFromBracket}/>
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
