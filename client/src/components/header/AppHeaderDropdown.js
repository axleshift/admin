import React from 'react'
import {
  CAvatar,
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
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
} from '@coreui/icons'
import avatar8 from './../../assets/images/avatars/8.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'



const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const handleLogout = () => {
 
    localStorage.removeItem('userToken')  
    localStorage.removeItem('userName')   
    localStorage.clear() 
     
      navigate('/login')
    }
  // Retrieve the user's name from session storage
  const name = sessionStorage.getItem('name')

  return (
    <CDropdown variant="nav-item">
    <CDropdownToggle>
      <FontAwesomeIcon icon={faUser} size="lg" className="me-2" />
      <span className="ms-2" style={{ position: 'relative', top: '2px' }} >{name ? `Welcome, ${name}` : 'Welcome, Guest'}</span>
    </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem>
          <CButton onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </CButton>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
