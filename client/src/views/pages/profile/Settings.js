import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faEnvelope, faUser, faLock } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom' // Import Link from react-router-dom

const Settings = () => {
  // Retrieve the user's data from session storage
  const name = sessionStorage.getItem('name')
  const email = sessionStorage.getItem('email')
  const role = sessionStorage.getItem('role')

  return (
    <div>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4" style={{ padding: '20px', marginBottom: '20px' }}>
              <CCardBody className="p-4">
                <h1>Settings</h1>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faUser} />
                  </CInputGroupText>
                  <span className="ms-2">{name ? `Welcome, ${name}` : 'Welcome, Guest'}</span>
                </CInputGroup>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </CInputGroupText>
                  <span className="ms-2">{email ? `Email: ${email}` : 'No email available'}</span>
                </CInputGroup>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faBriefcase} />
                  </CInputGroupText>
                  <span className="ms-2">{role ? `Role: ${role}` : 'No role'}</span>
                </CInputGroup>
                <CInputGroup className="mb-3">
                  <CInputGroupText>
                    <FontAwesomeIcon icon={faLock} />
                  </CInputGroupText>
                  <Link to="/changepass">
                    <CButton color="primary">Change Password</CButton>
                  </Link>
                </CInputGroup>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Settings
