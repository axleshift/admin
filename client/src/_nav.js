import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBeachAccess,
  cilBoatAlt,
  cilDollar,
  cilLocationPin,
  cilShieldAlt,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruckFast, faUser } from '@fortawesome/free-solid-svg-icons'

// Define the navigation items based on the user role
const _nav = (userRole) => [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Employee',
    to: '/employeedash',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavGroup,
    name: 'Administration',
    to: '',
    icon: <CIcon icon={cilBeachAccess} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Products',
        to: '/product',
      },
      ...(userRole === 'admin' || userRole === 'manager'
        ? [
            ...{
              component: CNavItem,
              name: 'Customers',
              to: '/customer',
            },
            {
              component: CNavItem,
              name: 'Employees',
              to: '/worker',
            },
            {
              component: CNavItem,
              name: 'Transactions',
              to: 'freight/transaction',
            },
          ]
        : []),
    ],
  },
  {
    component: CNavItem,
    name: 'Employees',
    to: 'hr1/EmployeeManagement',
    icon: <FontAwesomeIcon icon={faUser} />,
  },
  {
    component: CNavItem,
    name: 'Logistics',
    to: 'logistic1/index',
    icon: <FontAwesomeIcon icon={faTruckFast} />,
  },
  {
    component: CNavGroup,
    name: 'FREIGHT',
    to: '',
    icon: <CIcon icon={cilBoatAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'LandFreight',
        to: 'freight/land',
      },
      {
        component: CNavItem,
        name: 'Shipping',
        to: 'freight/shipping',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Track',
    to: '/track/PdfGenerator',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Pricing',
    to: '/pricing',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Threat',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Form Control',
        to: '/forms/form-control',
      },
      {
        component: CNavItem,
        name: 'Select',
        to: '/forms/select',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Register',
        to: '/register',
      },
    ],
  },
]

export default _nav
