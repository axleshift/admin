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

// Define the navigation items dynamically based on the user role and department
const _nav = () => {
  // Fetch user details from sessionStorage
  const userRole = sessionStorage.getItem('role'); // e.g., 'superadmin'
  const userDepartment = sessionStorage.getItem('department'); // e.g., 'HR'
  const userUsername = sessionStorage.getItem('username'); 

  // Debug log for dynamic data
  console.log("User Role:", userRole);
  console.log("User Department:", userDepartment);
  console.log("User username:", userUsername);

  const navItems = [];

  // Administrative Dashboard Item
  if (userDepartment === 'Administrative') {
    navItems.push({
      component: CNavItem,
      name: 'Dashboard',
      to: 'employeedash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info', text: 'NEW' },
    });
  }

  // Department-Specific Dashboards
  if (userDepartment === 'HR' || userDepartment === 'Administrative') {
    navItems.push({
      component: CNavItem,
      name: 'HR Dashboard',
      to: '/hrdash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info' },
    });
  }

  if (userDepartment === 'Finance' || userDepartment === 'Administrative') {
    navItems.push({
      component: CNavItem,
      name: 'Finance Dashboard',
      to: '/financedash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info' },
    });
  }

  if (userDepartment === 'Core' || userDepartment === 'Administrative') {
    navItems.push({
      component: CNavItem,
      name: 'Core Dashboard',
      to: '/coredash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info' },
    });
  }

  if (userDepartment === 'Logistics' || userDepartment === 'Administrative') {
    navItems.push({
      component: CNavItem,
      name: 'Logistic Dashboard',
      to: '/logisticdash',
      icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
      badge: { color: 'info' },
    });
  }

  // HR Section
  if (userDepartment === 'HR' || userDepartment === 'Administrative') {
    navItems.push(
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
      {
        component: CNavItem,
        name:'Payroll',
        icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />,
        to: '/payroll'
      }
    );
    
    // Superadmin-specific HR Items
    if (userRole === 'superadmin') {
      navItems.push({
        component: CNavItem, 
        name: 'Payroll', 
        icon: <FontAwesomeIcon icon={faSignsPost} style={{ marginRight: '8px' }} />, 
        to: '/payroll'
      });
    }
  }

  // Finance Section
  if (userDepartment === 'Finance' || userDepartment === 'Administrative') {
    navItems.push(
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
      }
    );
  }

  // Core Section
  if (userDepartment === 'Core' || userDepartment === 'Administrative') {
    navItems.push(
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
      }
    );
  }

  // Logistics Section
  if (userDepartment === 'Logistics' || userDepartment === 'Administrative') {
    navItems.push({ component: CNavTitle, name: 'LOGISTICS', className: 'custom-nav-title' });
  }

  // Administrative Section
  if (userDepartment === 'Administrative') {
    navItems.push(
      { component: CNavTitle, name: 'ADMINISTRATIVE', className: 'custom-nav-title' },
      { 
        component: CNavItem, 
        name: 'Activity', 
        icon: <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />, 
        to: 'useractivity/index' 
      },
      {
        component: CNavItem,
        name: 'Action',
        icon: <FontAwesomeIcon icon={faListCheck} style={{ marginRight: '8px' }} />,
        to: '/tack'
      },
      { 
        component: CNavItem, 
        name: 'Backup & Restore', 
        icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />, 
        to: '/recovery' 
      },
      { 
        component: CNavItem, 
        name: 'Backup & Restore', 
        icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />, 
        to: '/restore' 
      },
      { 
        component: CNavItem, 
        name: 'Toast', 
        icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />, 
        to: '/Toasts' 
      },
    
    );
  }

  return navItems;
};

export default _nav;
