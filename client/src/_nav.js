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
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruckFast, faUser ,faListCheck, faChartSimple, faCartShopping, faUserGroup, faHouse} from '@fortawesome/free-solid-svg-icons'

// Define the navigation items based on the user role
const _nav = (userRole) => [
  
  {
    component: CNavItem,
    name: 'Dashboard',
    to: 'dashboard/employeedash',
    icon: <FontAwesomeIcon icon ={faHouse} style={{ marginRight: '8px' }}  />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  {
    component: CNavTitle,
    name: 'Client',
  },
    {component: CNavItem,
      name:'Transactions',
      icon: <FontAwesomeIcon icon={faCartShopping} style={{ marginRight: '8px' }}  />,
      to: 'freight/transaction'
    },
    {component: CNavItem,
      name:'Customer',
      icon: <FontAwesomeIcon icon={faUserGroup} style={{ marginRight: '8px' }}  />,
      to: '/customer'
    },
  
  {
    component: CNavTitle,
    name: 'Sales',
  },
  {
    component: CNavTitle,
    name: 'Management',
  },


 
 

 
  
  {
    component: CNavTitle,
    name: 'Management',
  },
  {
    icon: <FontAwesomeIcon icon={faListCheck} />,
    component: CNavGroup,
    name: 'Admin',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      ...(userRole === 'admin' || userRole === 'manager'
        ? [
          {
            component: CNavItem,
            name: 'Employees',
            to: '/worker',
          },
            {
              component: CNavItem,
              name: 'Activity',
              to: 'useractivity/index',
            },
              {
              component: CNavItem,
              name: 'Performance',
              to: '/perform',
              icon: <FontAwesomeIcon icon={faChartSimple} style={{ marginRight: '8px' }}  />,
            },
         
           
          ]
        : []),
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
        name: 'Login',
        to: '/systemlogin',
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
