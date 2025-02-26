import React, {useState, useEffect} from 'react';
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
  faBell,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';

const _nav = () => {
  const userRole = sessionStorage.getItem('role');
  const userDepartment = sessionStorage.getItem('department');
  const userUsername = sessionStorage.getItem('username'); 
  const userId = sessionStorage.getItem('userId');
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
  const userEmail = sessionStorage.getItem('email');

  console.log("✅ Session Storage Values:", {
    Role: userRole,
    Department: userDepartment,
    Username: userUsername,
    "User ID": userId,
    Permissions: userPermissions,
    Email: userEmail
  });

  const [allowedRoutes, setAllowedRoutes] = useState([]);
  
  useEffect(() => {
    if (!userId) {
      console.error('❌ No userId found in sessionStorage');
      return;
    }

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:5053/hr/user/permissions/${userId}`);
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

  const navItems = [];

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
        '/chatbox',
        '/invoice'
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
        '/chatbox',
        '/recoverytuts'
      ]
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
        '/shipment',
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
      Logistics: [
        '/logisticdash',    // Add routes related to logistics
        '/shipment',
        '/customer',
        '/monthly',
        '/daily',
        '/breakdown',
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

  if (accessPermissions[userRole]?.[userDepartment]) {
    // Dashboard Section
    if (accessPermissions[userRole][userDepartment].includes('/employeedash')) {
      navItems.push(
        { 
          component: CNavItem,
          name: 'Dashboard',
          to: 'employeedash',
          icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
          badge: { color: 'info', text: 'NEW' },
        }
      );
    }

    // Department-Specific Dashboards
    const dashboards = [
      { path: '/hrdash', name: 'HR Dashboard' },
      { path: '/financedash', name: 'Finance Dashboard' },
      { path: '/coredash', name: 'Core Dashboard' },
      { path: '/logisticdash', name: 'Logistic Dashboard' }
    ];

    dashboards.forEach(dashboard => {
      if (accessPermissions[userRole][userDepartment].includes(dashboard.path)) {
        navItems.push({
          component: CNavItem,
          name: dashboard.name,
          to: dashboard.path,
          icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
          badge: { color: 'info' },
        });
      }
    });

    // Admin Section
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
        },
        {
          component: CNavItem, 
          name: 'Ex', 
          icon: <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />, 
          to: '/ex'
        },
        {
          component: CNavItem, 
          name: 'trial', 
          icon: <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />, 
          to: '/recovery'
        },
        {
          component: CNavItem, 
          name: 'NewUser', 
          icon: <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />, 
          to: '/registernew'
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
          name: 'Job Post', 
          icon: <FontAwesomeIcon icon={faSignsPost} style={{ marginRight: '8px' }} />, 
          to: '/jobposting' 
        },
        {
          component: CNavItem,
          name: 'Payroll',
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
          to: '/freight/transaction' 
        },
        { 
          component: CNavItem, 
          name: 'Overview', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/oversales' 
        },
        { 
          component: CNavItem, 
          name: 'Financial Analytics', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/financialanalytics' 
        },
        { 
          component: CNavItem, 
          name: 'Invoice', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/invoice' 
        },
        { 
          component: CNavItem, 
          name: 'Freight Audit', 
          icon: <FontAwesomeIcon icon={faCoins} style={{ marginRight: '8px' }} />, 
          to: '/freightaudit' 
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
        },
        { 
          component: CNavItem, 
          name: 'Shipment', 
          icon: <FontAwesomeIcon icon={faTruckFast} style={{ marginRight: '8px' }} />, 
          to: '/shipment' 
        }
      );
    }
    //logistic
    if (accessPermissions[userRole][userDepartment].includes('/logisticdash')){
      navItems.push(
        {   component:CNavTitle, name: 'Logistic', className: 'custom-nav-title'},
        {
          component:CNavTitle,
          name:'Logistic',
          icon:<FontAwesomeIcon icon={faGlobe} style={{ marginRight:'8px'}}/>,
          to:'/logistic1/index'
        }
      )
    }
    // Only add Access Permissions section if user is not superadmin
    if (userRole !== 'superadmin') {
      // Add "Access Permissions" section at the end
      navItems.push(
        { component: CNavTitle, name: 'Access Permissions', className: 'custom-nav-title' }
      );

      // Add all allowed routes that aren't already in the standard sections
      const standardRoutes = new Set(navItems.filter(item => item.to).map(item => item.to));
      allowedRoutes.forEach(route => {
        if (!standardRoutes.has(route)) {
          navItems.push({
            component: CNavItem,
            name: route.split('/').pop().charAt(0).toUpperCase() + route.split('/').pop().slice(1),
            to: route,
            icon: <FontAwesomeIcon icon={faHouse} style={{ marginRight: '8px' }} />,
          });
        }
      });
    }
  }

  return navItems;
};

export default _nav;