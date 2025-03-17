// src/components/AppSidebar.js
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.changeState.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow)

  const reduxUserRole = useSelector((state) => state.changeState.auth?.role)
  const reduxUserDepartment = useSelector((state) => state.changeState.auth?.department)
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role') || 'guest')
  const [userDepartment, setUserDepartment] = useState(sessionStorage.getItem('department') || 'none')

  useEffect(() => {
    if (reduxUserRole) {
      setUserRole(reduxUserRole)
      sessionStorage.setItem('role', reduxUserRole)
    } else {
      const sessionRole = sessionStorage.getItem('role')
      if (sessionRole) {
        setUserRole(sessionRole)
      }
    }

    if (reduxUserDepartment) {
      setUserDepartment(reduxUserDepartment)
      sessionStorage.setItem('department', reduxUserDepartment)
    } else {
      const sessionDepartment = sessionStorage.getItem('department')
      if (sessionDepartment) {
        setUserDepartment(sessionDepartment)
      }
    }
  }, [reduxUserRole, reduxUserDepartment])

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
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

      <AppSidebarNav items={navigation(userRole, userDepartment)} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default AppSidebar
