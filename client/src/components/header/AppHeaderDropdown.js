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
import { faPersonBooth, faGears, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
  }

  const handleLogout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.clear()

    // Remove tokens from cookies
    deleteCookie('accessToken')
    deleteCookie('refreshToken')

    // Clear session data
    sessionStorage.clear()

    // Navigate to login page
    navigate('/login')
  }

  // Retrieve the user's name from session storage
  const name = sessionStorage.getItem('name')

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle>
        <FontAwesomeIcon icon={faUser} size="lg" className="me-2" />
        <span className="ms-2" style={{ position: 'relative', top: '2px' }}>
          {name ? `Welcome, ${name}` : 'Welcome, Guest'}
        </span>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem href="/profile">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="/settings">
          <FontAwesomeIcon icon={faGears} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="/request">
          <FontAwesomeIcon icon={faPersonBooth} className="me-2" />
          Access Request
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