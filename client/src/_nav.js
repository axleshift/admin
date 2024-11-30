import React from 'react'
import '../src/scss/_custom.scss'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruckFast, faUser, faListCheck, faChartSimple, faCartShopping, faUserGroup, faHouse, faCoins, faCalendar, faCalendarDays, faCheck, faPieChart, faWindowRestore } from '@fortawesome/free-solid-svg-icons'

// Define the navigation items based on the user role
const _nav = (userRole) => [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: 'employeedash',
    icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  {
    component: CNavTitle,
    name: 'Client',
    className: 'custom-nav-title', // Apply the class here
  },
  {
    component: CNavItem,
    name: 'Transactions',
    icon: <FontAwesomeIcon icon={faCartShopping} style={{ marginRight: '8px' }} />,
    to: 'freight/transaction',
  },
  {
    component: CNavItem,
    name: 'Customer',
    icon: <FontAwesomeIcon icon={faUserGroup} style={{ marginRight: '8px' }} />,
    to: '/customer',
  },

  {
    component: CNavTitle,
    name: 'Sales',
    className: 'custom-nav-title', // Apply the class here
  },
  {
    component: CNavItem,
    name: 'Overview',
    icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />,
    to: '/oversales',
  },
  {
    component: CNavItem,
    name: 'Monthly',
    icon: <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px' }} />,
    to: '/monthly',
  },
  {
    component: CNavItem,
    name: 'Daily',
    icon: <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '8px' }} />,
    to: '/daily',
  },
  {
    component: CNavItem,
    name: 'Breakdown',
    icon: <FontAwesomeIcon icon={faPieChart} style={{ marginRight: '8px' }} />,
    to: '/breakdown',
  },

  {
    component: CNavTitle,
    name: 'Management',
    className: 'custom-nav-title', // Apply the class here
  },

  ...(userRole === 'admin' || userRole === 'manager'
    ? [
        {
          component: CNavItem,
          name: 'Employees',
          icon: <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />,
          to: '/worker',
        },
        {
          component: CNavItem,
          name: 'Activity',
          icon: <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />,
          
          to: 'useractivity/index',
        },
        {
          component: CNavItem,
          name: 'Backup & Restore',
          icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />,
          
          to: '/recovery',
        },
      
      ]
    : []),
];

export default _nav
