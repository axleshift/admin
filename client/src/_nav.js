import React, {useState,useEffect} from 'react';
import axios from 'axios';
import '../src/scss/_custom.scss';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruckFast, faUser, faListCheck, faChartSimple, 
  faCartShopping, faUserGroup, faHouse, faCoins, 
  faCalendar, faCalendarDays, faCheck, faPieChart, 
  faWindowRestore, faSignsPost, 
  faBullhorn,
  faSquarePersonConfined,
  faBell
} from '@fortawesome/free-solid-svg-icons';

// Define the navigation items dynamically based on the user role and department

const _nav = () => {
  // Fetch user details from sessionStorage
  const userRole = sessionStorage.getItem('role'); // e.g., 'superadmin'
  const userDepartment = sessionStorage.getItem('department'); // e.g., 'HR'
  const userUsername = sessionStorage.getItem('username'); 
  const userId = sessionStorage.getItem('userId'); // Declare userId properly
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
  const [allowedRoutes, setAllowedRoutes] = useState([]);

  // Debug log for dynamic data
  console.log("User Role:", userRole);
  console.log("User Department:", userDepartment);
  console.log("User username:", userUsername);
  console.log("✅ Retrieved Permissions from sessionStorage:", userPermissions);


  useEffect(() => {
    if (!userId) {
      console.error('❌ No userId found in sessionStorage');
      return;
    }

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:5053/hr/user/${userId}/permissions`);

        console.log('✅ API Response:', response.data);
        
        if (response.data.permissions && response.data.permissions.length > 0) {
          setAllowedRoutes(response.data.permissions);
        } else {
          console.warn('⚠️ No permissions found for this user.');
        }

      } catch (error) {
        console.error('❌ Error fetching permissions:', error);
      }
    };
    if (!userPermissions.length) {
      fetchUserPermissions();
    } else {
      setAllowedRoutes(userPermissions);
    }
  }, [userId]);

 

  console.log('✅ Allowed Routes:', allowedRoutes);
  const allNavItems = [
    { path: "/employeedash", name: "Dashboard", icon: faHouse },
    { path: "/hrdash", name: "HR Dashboard", icon: faHouse },
    { path: "/financedash", name: "Finance Dashboard", icon: faHouse },
    { path: "/coredash", name: "Core Dashboard", icon: faHouse },
    { path: "/logisticdash", name: "Logistic Dashboard", icon: faHouse },
    { path: "/useractivity/index", name: "User Activity", icon: faListCheck },
    { path: "/restore", name: "Restore", icon: faWindowRestore },
    { path: "/tack", name: "Button", icon: faBell },
    { path: "/freight/transaction", name: "Transactions", icon: faCartShopping },
    { path: "/oversales", name: "Overview", icon: faCoins },
    { path: "/worker", name: "Employees", icon: faUser },
    { path: "/jobposting", name: "Job Post", icon: faSignsPost },
    { path: "/payroll", name: "Payroll", icon: faCoins },
    { path: "/customer", name: "Customer", icon: faUserGroup },
    { path: "/monthly", name: "Monthly", icon: faCalendar },
    { path: "/daily", name: "Daily", icon: faCalendarDays },
    { path: "/breakdown", name: "Breakdown", icon: faPieChart },
  ];
  
  const accessPermissions = {
    superadmin: {
      HR: [
        '/employeedash',
        '/hrdash',
        '/financedash',
        '/coredash',
        '/logisticdash',
        '/worker',
        '/jobposting',
        '/payroll',
        '/freight/transaction',
        '/oversales',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
        '/useractivity/index',
        '/announce',
        '/restore',
        '/tack',
        '/recovery',
        '/Toasts',
        '/chatbox'
      ],
      Core: [
        '/employeedash',
        '/hrdash',
        '/financedash',
        '/coredash',
        '/logisticdash',
        '/worker',
        '/jobposting',
        '/payroll',
        '/freight/transaction',
        '/oversales',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
        '/useractivity/index',
        '/announce',
        '/restore',
        '/tack',
        '/recovery',
        '/Toasts',
        '/chatbox'
      ],
      Logistic: [
        '/employeedash',
        '/hrdash',
        '/financedash',
        '/coredash',
        '/logisticdash',
        '/worker',
        '/jobposting',
        '/payroll',
        '/freight/transaction',
        '/oversales',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
        '/useractivity/index',
        '/announce',
        '/restore',
        '/tack',
        '/recovery',
        '/Toasts',
        '/chatbox'
      ],
      Finance: [
        '/employeedash',
        '/hrdash',
        '/financedash',
        '/coredash',
        '/logisticdash',
        '/worker',
        '/jobposting',
        '/payroll',
        '/freight/transaction',
        '/oversales',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
        '/useractivity/index',
        '/announce',
        '/restore',
        '/tack',
        '/recovery',
        '/Toasts',
        '/chatbox'
      ],
      Administrative: [
        '/employeedash',
        '/hrdash',
        '/financedash',
        '/coredash',
        '/logisticdash',
        '/worker',
        '/jobposting',
        '/payroll',
        '/freight/transaction',
        '/oversales',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
        '/useractivity/index',
        '/announce',
        '/restore',
        '/tack',
        '/recovery',
        '/Toasts',
        '/chatbox'
      ],
      // ... other departments
    },
    admin: {
      HR: [
        '/hrdash',
        '/worker',
        '/jobposting',
        '/payroll',
      ],
      Core: [
        '/coredash',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
      ],
      Finance: [
        '/financedash',
        '/freight/transaction',
        '/oversales',
      ],
      Logistic: [
        '/logisticdash',
      ],
      Administrative: [
        '/employeedash',
        '/useractivity/index',
        '/restore',
      ]
    },
    Manager: {
      HR: [
        '/hrdash',
        '/worker',
        '/jobposting',
      ],
      Core: [
        '/coredash',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
      ],
      Finance: [
        '/financedash',
        '/freight/transaction',
        '/oversales',
      ],
      Logistic: [
        '/logisticdash',
      ],
      Administrative: [
        '/employeedash',
        '/useractivity/index',
      ]
    }
  };

  const navItems = allowedRoutes.map(route => ({
    component: CNavItem,
    name: route,
    to: route,
    icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
  }));



  

  // Check if accessPermissions exists for the userRole and userDepartment
  if (accessPermissions[userRole] && accessPermissions[userRole][userDepartment]) {
    // Administrative Dashboard Item
    if (accessPermissions[userRole][userDepartment].includes('/employeedash')) {
      navItems.push(
       { 
        component: CNavItem,
        name: 'Dashboard',
        to: 'employeedash',
        icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
        badge: { color: 'info', text: 'NEW' },
      },
      
    );
    }

    // Department-Specific Dashboards
    if (accessPermissions[userRole][userDepartment].includes('/hrdash')) {
      navItems.push({
        component: CNavItem,
        name: 'HR Dashboard',
        to: '/hrdash',
        icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
        badge: { color: 'info' },
      });
    }

    if (accessPermissions[userRole][userDepartment].includes('/financedash')) {
      navItems.push({
        component: CNavItem,
        name: 'Finance Dashboard',
        to: '/financedash',
        icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
        badge: { color: 'info' },
      });
    }

    if (accessPermissions[userRole][userDepartment].includes('/coredash')) {
      navItems.push({
        component: CNavItem,
        name: 'Core Dashboard',
        to: '/coredash',
        icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
        badge: { color: 'info' },
      });
    }

    if (accessPermissions[userRole][userDepartment].includes('/logisticdash')) {
      navItems.push({
        component: CNavItem,
        name: 'Logistic Dashboard',
        to: '/logisticdash',
        icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
        badge: { color: 'info' },
      });
    }

    if (accessPermissions[userRole][userDepartment].includes('/useractivity/index')) {
      navItems.push(
        { component: CNavTitle, name: 'Admin', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'User Activity', 
          icon: <FontAwesomeIcon icon={faListCheck} style={{ marginRight: '8px' }} />, 
          to: '/useractivity/index' 
        },
        { 
          component: CNavItem, 
          name: 'Restore', 
          icon: <FontAwesomeIcon icon={faWindowRestore} style={{ marginRight: '8px' }} />, 
          to: '/restore' 
        },
        {
          component: CNavItem, 
          name: 'Button', 
          icon: <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />, 
          to: '/tack'
        }
      );
    }

    // Finance Section
    if (accessPermissions[userRole][userDepartment].includes('/freight/transaction')) {
      navItems.push(
        { component: CNavTitle, name: 'Finance', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Transactions', 
          icon: <FontAwesomeIcon icon={faCartShopping} style={{ marginRight: '8px' }} />, 
          to: '/freight/transaction' 
        },
        { 
          component: CNavItem, 
          name: 'Overview', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/oversales' 
        }
      );
    }

    // Logistic Section
    if (accessPermissions[userRole][userDepartment].includes('/logisticdash')) {
      navItems.push(
        { component: CNavTitle, name: 'Logistics', className: 'custom-nav-title' },
        { 
          component: CNavItem, 
          name: 'Logistics Dashboard', 
          icon: <FontAwesomeIcon icon={faTruckFast} style={{ marginRight: '8px' }} />, 
          to: '/logisticdash' 
        }
      );
    }

    // HR Section
    if (accessPermissions[userRole][userDepartment].includes('/worker')) {
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
    }

    // Finance Section
    if (accessPermissions[userRole][userDepartment].includes('/freight/transaction')) {
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
    if (accessPermissions[userRole][userDepartment].includes('/customer')) {
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
  }

  return navItems;
};

export default _nav;
