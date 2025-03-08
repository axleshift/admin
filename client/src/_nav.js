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
  faGlobe,
  faShield,
  faHand,
  faUniversalAccess,
  faPersonBooth
} from '@fortawesome/free-solid-svg-icons';

/**
 * Navigation configuration function that returns navigation items based on user role and permissions
 */
const _nav = (userRole, userDepartment) => {
  // Log session storage values for debugging
  console.log("✅ Session Storage Values:", {
    Role: userRole,
    Department: userDepartment
  });

  // Array to store navigation items
  const navItems = [];

  // ===== PERMISSION CONFIGURATION =====
  // This object defines which routes each role+department combination has access to
  const accessPermissions = {
    // Superadmin permissions by department
    superadmin: {
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
        '/recoverytuts',
        '/monitoring',
        '/Request'
      ],
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
      ]
    },
    // Admin permissions by department
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
        '/logisticdash',
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
    // Manager permissions by department
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

  // Check if current user role and department has any permissions defined
  if (accessPermissions[userRole]?.[userDepartment]) {
    // ===== NAVIGATION SECTIONS BUILDING =====
    
    // ===== DASHBOARD SECTION =====
    // Add main dashboard if user has access
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

    // Add department-specific dashboards
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

    // ===== ADMIN SECTION =====
    // Add admin section if user has access to user activity page
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
          name: 'PendingRequest', 
          icon: <FontAwesomeIcon icon={faHand} style={{ marginRight: '8px' }} />, 
          to: '/PendingRequest'
        },
        {
          component: CNavItem, 
          name: 'AccessReview', 
          icon: <FontAwesomeIcon icon={faUniversalAccess} style={{ marginRight: '8px' }} />, 
          to: '/AccessReview'
        },
        {
          component: CNavItem, 
          name: 'NewUser', 
          icon: <FontAwesomeIcon icon={faBell} style={{ marginRight: '8px' }} />, 
          to: '/registernew'
        },
        {
          component: CNavItem, 
          name: 'Security Monitoring', 
          icon: <FontAwesomeIcon icon={faShield} style={{ marginRight: '8px' }} />, 
          to: '/monitoring'
        },
      );
    }

    // ===== HR SECTION =====
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

    // ===== FINANCE SECTION =====
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

    // ===== CORE SECTION =====
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
    
    // ===== LOGISTIC SECTION =====
    if (accessPermissions[userRole][userDepartment].includes('/logisticdash')){
      navItems.push(
        { component: CNavTitle, name: 'Logistic', className: 'custom-nav-title' },
        {
          component: CNavItem,
          name: 'Logistic',
          icon: <FontAwesomeIcon icon={faGlobe} style={{ marginRight:'8px' }}/>,
          to: '/logistic1/index'
        }
      );
    }

    // ===== ACCESS PERMISSIONS SECTION =====
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