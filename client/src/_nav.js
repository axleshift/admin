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
  faGlobe,
  faShield,
  faHand,
  faUniversalAccess,
  faPersonBooth
} from '@fortawesome/free-solid-svg-icons';


const _nav = () => {
  
  const userRole = sessionStorage.getItem('role');
  const userName = sessionStorage.getItem('name')
  const userDepartment = sessionStorage.getItem('department');
  const userUsername = sessionStorage.getItem('username'); 
  const userId = sessionStorage.getItem('userId');
  const userPermissions = JSON.parse(sessionStorage.getItem('permissions') || '[]');
  const userEmail = sessionStorage.getItem('email');

  


  const [allowedRoutes, setAllowedRoutes] = useState([]);
  
  
  useEffect(() => {
    if (!userId) {
      console.error('❌ No userId found in sessionStorage');
      return;
    }

    const fetchUserPermissions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/hr/permissions/${userId}`);
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
        '/recovery',
        '/Toasts',
        '/chatbox',
        '/recoverytuts',
        '/monitoring',
        '/Request',
        './usermanagement',
        '/button',
        '/announce'
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
        '/button',
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
'/button',
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
'/button',
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
'/button',
        '/recovery',
        '/Toasts',
        '/chatbox'
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
          to: '/button'
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
          name:'Announce',
          icon: <FontAwesomeIcon icon={faBullhorn} style={{ marginRight: '8px' }} />,
          to:'/announce'
        },
        {
          component: CNavItem,
          name:'Monitoring',
          icon: <FontAwesomeIcon icon={faShield} style={{ marginRight: '8px' }} />,
          to:'/monitoring'
        },
       {
        component: CNavItem,
        name:'Employee Leaves',
        icon: <FontAwesomeIcon icon={faSquarePersonConfined} style={{ marginRight: '8px' }} />,
        to:'/hr3leaverequest'
       }
      );
    }

    
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
    
    
    if (accessPermissions[userRole][userDepartment].includes('/logisticdash')){
      navItems.push(
        { component: CNavTitle, name: 'Logistic', className: 'custom-nav-title' },
        {
          component: CNavItem,
          name: 'Logistic',
          icon: <FontAwesomeIcon icon={faGlobe} style={{ marginRight:'8px' }}/>,
          to: '/logistic1/index'
        },
        {
          component: CNavItem,
          name: 'Vehicles',
          icon: <FontAwesomeIcon icon={faGlobe} style={{ marginRight:'8px' }}/>,
          to: '/vehicles'
        }
      );
    }

    
    
    if (userRole !== 'superadmin') {
      
      navItems.push(
        { component: CNavTitle, name: 'Access Permissions', className: 'custom-nav-title' }
      );

      
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