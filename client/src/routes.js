import React from 'react';
import ProtectedRoute from './components/ProtectedRoute';

//dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/employeedash'));
const HrDash = React.lazy(() => import('./views/dashboard/hrdash'));
const CoreDash = React.lazy(() => import('./views/dashboard/coredash'));
const FinanceDash = React.lazy(() => import('./views/dashboard/financedash'));
const LogisticDash = React.lazy(() => import('./views/dashboard/logisticdash'));
const Announce = React.lazy(() => import('./views/pages/Announcement/announce'));
const Chatbox = React.lazy(() => import('./views/pages/scene/chatbox'));
const Register = React.lazy(() => import('./views/pages/register/registerNew'));

const Request = React.lazy(()=> import ('./views/pages/scene/Request'));

const Monitoring = React.lazy(()=> import ('./views/pages/Security/monitoring'))
const UserManager = React.lazy(() => import ('./views/pages/Security/UserManagement'))
// hr
const Worker = React.lazy(() => import('./views/pages/integrate/hr/works'));
const Jobpost = React.lazy(() => import('./views/pages/integrate/hr/jobposting'));
const Payroll = React.lazy(() => import('./views/pages/integrate/hr/payroll'));
// core
const Shipment = React.lazy(() => import("./views/pages/integrate/core/shipment"));

// finance
const FreightAudit = React.lazy(() => import("./views/pages/integrate/finance/freightaudit"))
const FinancialAnalytics = React.lazy(() => import("./views/pages/integrate/finance/financialanalytics"))
const Invoice = React.lazy(() => import("./views/pages/integrate/finance/invoice"))
const Customers = React.lazy(() => import('./views/pages/integrate/finance/customer'));
// logistics

const Profile = React.lazy(() => import('./views/pages/profile/Profile'));
const Land = React.lazy(() => import('./views/pages/freight/land'));
const Transaction = React.lazy(() => import('./views/pages/freight/transaction'));
const Shipping = React.lazy(() => import('./views/pages/freight/shipping'));

// sales
const Sales = React.lazy(() => import('./views/pages/sales/oversales'));
const Daily = React.lazy(() => import('./views/pages/sales/daily.js'));
const Monthly = React.lazy(() => import('./views/pages/sales/monthly'));
const Breakdown = React.lazy(() => import('./views/pages/sales/breakdown'));

const Activity = React.lazy(() => import('./views/pages/useractivity/index'));
const AccessReview = React.lazy(() => import('./views/pages/scene/AccessReview'));
const Restore = React.lazy(()=> import('./views/pages/scene/recovery'));
const Settings = React.lazy(() => import('./views/pages/profile/Settings'));
const Changepass = React.lazy(() => import('./views/pages/profile/changepass'));

// logistic
const Logistic1 = React.lazy(() => import('./views/pages/integrate/logistic1/index'));
const Pin = React.lazy(() => import('./views/pages/integrate/logistic1/pin.js'));

//trial

const Toast = React.lazy(() => import('./views/notifications/toasts/Toasts'));

const PendingRequest = React.lazy(()=>import ('./views/pages/scene/PendingRequest'))

const routes = [
  { path: '/', exact: true, name: 'Home' },

//dashboard
  { path: '/employeedash', name: 'Dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/hrdash', name: 'Dashboard', element: <ProtectedRoute><HrDash /></ProtectedRoute> },
  { path: '/logisticdash', name: 'Dashboard', element: <ProtectedRoute><LogisticDash /></ProtectedRoute> },
  { path: '/coredash', name: 'Dashboard', element: <ProtectedRoute><CoreDash /></ProtectedRoute> },
  { path: '/financedash', name: 'Dashboard', element: <ProtectedRoute><FinanceDash /></ProtectedRoute> },


  { path: '/announce' , name: 'Announcement', element: <ProtectedRoute><Announce /></ProtectedRoute>},
  { path: '/chatbox' , name:'chatbox', element: <ProtectedRoute><Chatbox/></ProtectedRoute>},

  { path: '/registerNew', name: 'Register New Users', element: <ProtectedRoute><Register /> </ProtectedRoute>},

  { path: '/request', name: 'Request', element: <ProtectedRoute><Request /> </ProtectedRoute>},

  { path: '/customer', name: 'Customer', element: <ProtectedRoute><Customers /></ProtectedRoute> },
   { path: '/worker', name: 'Employees', element: <ProtectedRoute><Worker /></ProtectedRoute> },
  { path: '/jobposting', name: 'Job Posting', element: <ProtectedRoute><Jobpost /></ProtectedRoute> },
  { path: '/payroll', name: 'Payroll', element: <ProtectedRoute><Payroll /></ProtectedRoute> },
  { path: '/profile', name: 'Profile Page', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/freight/land', name: 'Freight Land', element: <ProtectedRoute><Land /></ProtectedRoute> },
  { path: '/freight/transaction', name: 'Freight transaction', element: <ProtectedRoute><Transaction /></ProtectedRoute> },
  { path: '/freight/shipping', name: 'Freight shipping', element: <ProtectedRoute><Shipping /></ProtectedRoute> },
  { path: '/useractivity/index', name: 'ACTIVITY', element: <ProtectedRoute><Activity /></ProtectedRoute> },
  { path: '/AccessReview', name: 'AccessReview', element: <ProtectedRoute><AccessReview /></ProtectedRoute> },
  { path: '/restore', name: 'RESTORE', element: <ProtectedRoute><Restore /></ProtectedRoute> },

  { path: '/Settings', name: 'Settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: '/changepass', name: 'ChangePassword', element: <ProtectedRoute><Changepass /></ProtectedRoute> },
  { path: '/oversales', name: 'Oversales', element: <ProtectedRoute><Sales /></ProtectedRoute> },
  { path: '/monthly', name: 'Monthly', element: <ProtectedRoute><Monthly /></ProtectedRoute> },
  { path: '/daily', name: 'Daily', element: <ProtectedRoute><Daily /></ProtectedRoute> },
  { path: '/breakdown', name: 'Breakdown ', element: <ProtectedRoute><Breakdown /></ProtectedRoute> },
  { path: '/logistic1/index', name: 'OPERATIONAL', element: <ProtectedRoute><Logistic1 /></ProtectedRoute> },
  { path: '/logistic1/pin', name: 'Track', element: <ProtectedRoute><Pin /></ProtectedRoute> },
  { path: '/monitoring', name: 'Monitoring', element: <ProtectedRoute><Monitoring/></ProtectedRoute>},
  { path: '/usermanagement', name:'User Management', element: <ProtectedRoute><UserManager/></ProtectedRoute>},
  { path: '/PendingRequest', name:'PendingRequest', element: <ProtectedRoute><PendingRequest /></ProtectedRoute>},

  //finance
  { path: '/freightaudit', name:'FreightAudit', element: <ProtectedRoute><FreightAudit /></ProtectedRoute> },
  { path: '/financialanalytics', name:'FreightAudit', element: <ProtectedRoute><FinancialAnalytics /></ProtectedRoute> },
  { path: '/invoice', name:'FreightAudit', element: <ProtectedRoute><Invoice /></ProtectedRoute> },

  //core
  { path: '/shipment', name: 'Shipment', element: <ProtectedRoute><Shipment /></ProtectedRoute> },
  //trial
  { path: '/Toasts', name: 'Toasts', element: <ProtectedRoute><Toast /></ProtectedRoute> },
];

export default routes;