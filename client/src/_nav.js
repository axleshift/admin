import React from 'react';
import '../src/scss/_custom.scss';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruckFast, faUser, faListCheck, faChartSimple, 
  faCartShopping, faUserGroup, faHouse, faCoins, 
  faCalendar, faCalendarDays, faCheck, faPieChart, 
  faWindowRestore, faSignsPost 
} from '@fortawesome/free-solid-svg-icons';

// Define the navigation items based on the user role and department
const _nav = (userRole, userDepartment) => {
  // Debug log for userDepartment
  console.log("userDepartment in _nav:", userDepartment);

  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: 'employeedash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info', text: 'NEW' },
    },

    // HR Section
    ...(userDepartment === 'HR' || userDepartment === 'Administrative'
      ? [
        { component: CNavTitle, name: 'HR', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Employees', 
          icon: <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />, 
          to: '/worker' 
        },
        { 
          component: CNavItem, 
          name: 'JobPost', 
          icon: <FontAwesomeIcon icon={faSignsPost} style={{ marginRight: '8px' }} />, 
          to: '/jobposting' 
        },
        ...(userRole === 'superadmin' ? [
          { 
            component: CNavItem, 
            name: 'Payroll', 
            icon: <FontAwesomeIcon icon={faSignsPost} style={{ marginRight: '8px' }} />, 
            to: '/payroll' 
          }
        ] : []),
        { 
          component: CNavItem, 
          name: 'Payroll', 
          icon: <FontAwesomeIcon icon={faSignsPost} style={{ marginRight: '8px' }} />, 
          to: '/payroll' 
        },
      ]
      : []),

    // Finance Section
    ...(userDepartment === 'Finance' || userDepartment === 'Administrative'
      ? [
        { component: CNavTitle, name: 'Finance', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Transactions', 
          icon: <FontAwesomeIcon icon={faCartShopping} style={{ marginRight: '8px' }} />, 
          to: 'freight/transaction' 
        },
        { 
          component: CNavItem, 
          name: 'Overview', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/oversales' 
        },
      ]
      : []),

    // Core Section
    ...(userDepartment === 'Core' || userDepartment === 'Administrative'
      ? [
        { component: CNavTitle, name: 'CORE', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Customer', 
          icon: <FontAwesomeIcon icon={faUserGroup} style={{ marginRight: '8px' }} />, 
          to: '/customer' 
        },
        { 
          component: CNavItem, 
          name: 'Monthly', 
          icon: <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '8px' }} />, 
          to: '/monthly' 
        },
        { 
          component: CNavItem, 
          name: 'Daily', 
          icon: <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '8px' }} />, 
          to: '/daily' 
        },
        { 
          component: CNavItem, 
          name: 'Breakdown', 
          icon: <FontAwesomeIcon icon={faPieChart} style={{ marginRight: '8px' }} />, 
          to: '/breakdown' 
        },
      ]
      : []),

    // Logistics Section
    ...(userDepartment === 'Logistics' || userDepartment === 'Administrative'
      ? [
        { component: CNavTitle, name: 'LOGISTICS', className: 'custom-nav-title' },
      ]
      : []),

    // Administrative Section
    ...(userDepartment === 'Administrative'
      ? [
        { component: CNavTitle, name: 'ADMINISTRATIVE', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Activity', 
          icon: <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />, 
          to: 'useractivity/index' 
        },
        { 
          component: CNavItem, 
          name: 'Backup & Restore', 
          icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />, 
          to: '/recovery' 
        },
      ]
      : []),
  ];
};

export default _nav;
