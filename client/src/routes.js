import React from 'react';
import ProtectedRoute from './components/ProtectedRoute';


const Dashboard = React.lazy(() => import('./views/dashboard/employeedash'));
const HrDash = React.lazy(() => import('./views/dashboard/hrdash'));
const CoreDash = React.lazy(() => import('./views/dashboard/coredash'));
const FinanceDash = React.lazy(() => import('./views/dashboard/financedash'));
const LogisticDash = React.lazy(() => import('./views/dashboard/logisticdash'));
const Announce = React.lazy(() => import('./views/pages/Announcement/announce'));
const Register = React.lazy(() => import('./views/pages/register/registerNew'));

const Request = React.lazy(()=> import ('./views/pages/scene/Request'));
const Cron = React.lazy(()=> import ('./views/pages/scene/cron'))

const Monitoring = React.lazy(()=> import ('./views/pages/Security/monitoring'))
const UserManager = React.lazy(() => import ('./views/pages/Security/UserManagement'))
const SecurityCheck = React.lazy(() => import ('./views/pages/Security/SecurityCheck'))
const PasswordAnalysis = React.lazy(()=>import('./views/pages/Security/PasswordAnalysis'))

const Worker = React.lazy(() => import('./views/pages/integrate/hr/works'));
const Jobpost = React.lazy(() => import('./views/pages/integrate/hr/jobposting'));
const Payroll = React.lazy(() => import('./views/pages/integrate/hr/payroll'));
const LeaveRequest = React.lazy(() => import('./views/pages/integrate/hr/h3leaverequest'));


const Shipment = React.lazy(() => import("./views/pages/integrate/core/shipment"));
const Insight = React.lazy(() => import ('./views/pages/integrate/core/insight'))
const Shipment_insight = React.lazy(() => import('./views/pages/integrate/core/core analysys overtime/insightShipment'))
const Cost_insight = React.lazy(() => import('./views/pages/integrate/core/core analysys overtime/insightCost'))
const Item_insight = React.lazy(() => import('./views/pages/integrate/core/core analysys overtime/insightItem'))
const Weight_insight = React.lazy(() => import('./views/pages/integrate/core/core analysys overtime/insightWeight'))

const FreightAudit = React.lazy(() => import("./views/pages/integrate/finance/freightaudit"))
const FinancialAnalytics = React.lazy(() => import("./views/pages/integrate/finance/financialanalytics"))
const Invoice = React.lazy(() => import("./views/pages/integrate/finance/invoice"))
const Customers = React.lazy(() => import('./views/pages/integrate/finance/customer'));


const Profile = React.lazy(() => import('./views/pages/profile/Profile'));
const Land = React.lazy(() => import('./views/pages/freight/land'));


const Sales = React.lazy(() => import('./views/pages/sales/oversales'));
const Daily = React.lazy(() => import('./views/pages/sales/daily.js'));
const Monthly = React.lazy(() => import('./views/pages/sales/monthly'));
const Breakdown = React.lazy(() => import('./views/pages/sales/breakdown'));

const Activity = React.lazy(() => import('./views/pages/useractivity/index'));
const AccessReview = React.lazy(() => import('./views/pages/scene/AccessReview'));
const Restore = React.lazy(()=> import('./views/pages/scene/recovery'));
const Settings = React.lazy(() => import('./views/pages/profile/Settings'));
const Changepass = React.lazy(() => import('./views/pages/profile/changepass'));


const Logistic1 = React.lazy(() => import('./views/pages/integrate/logistic1/index'));
const Pin = React.lazy(() => import('./views/pages/integrate/logistic1/pin.js'));
const Vehicles = React.lazy (()=> import('./views/pages/integrate/logistic1/vehicles'))

const Button = React.lazy(()=> import ("./views/pages/scene/button"))
const Toast = React.lazy(() => import('./views/notifications/toasts/Toasts'));

const PendingRequest = React.lazy(()=>import ('./views/pages/scene/PendingRequest'))

const routes = [
  { path: '/', exact: true, name: 'Home' },


  { path: '/employeedash', name: 'Dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/hrdash', name: 'Dashboard', element: <ProtectedRoute><HrDash /></ProtectedRoute> },
  { path: '/logisticdash', name: 'Dashboard', element: <ProtectedRoute><LogisticDash /></ProtectedRoute> },
  { path: '/coredash', name: 'Dashboard', element: <ProtectedRoute><CoreDash /></ProtectedRoute> },
  { path: '/financedash', name: 'Dashboard', element: <ProtectedRoute><FinanceDash /></ProtectedRoute> },


  { path: '/announce' , name: 'Announcement', element: <ProtectedRoute><Announce /></ProtectedRoute>},

  { path: '/registerNew', name: 'Register New Users', element: <ProtectedRoute><Register /> </ProtectedRoute>},

  { path: '/request', name: 'Request', element: <ProtectedRoute><Request /> </ProtectedRoute>},
  { path: '/cron', name: 'Cron', element: <ProtectedRoute><Cron/> </ProtectedRoute>},

  { path: '/customer', name: 'Customer', element: <ProtectedRoute><Customers /></ProtectedRoute> },
   { path: '/worker', name: 'Employees', element: <ProtectedRoute><Worker /></ProtectedRoute> },
  { path: '/jobposting', name: 'Job Posting', element: <ProtectedRoute><Jobpost /></ProtectedRoute> },
  { path: '/payroll', name: 'Payroll', element: <ProtectedRoute><Payroll /></ProtectedRoute> },
  { path: '/hr3leaverequest', name: 'Leave Request', element: <ProtectedRoute><LeaveRequest /></ProtectedRoute> },

  { path: '/profile', name: 'Profile Page', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/freight/land', name: 'Freight Land', element: <ProtectedRoute><Land /></ProtectedRoute> },
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
  { path: '/securitycheck' , name:'Security Check', element: <ProtectedRoute><SecurityCheck/></ProtectedRoute>},
  { path: '/passwordanalysis', name:"password Analysis", element: <ProtectedRoute><PasswordAnalysis/></ProtectedRoute>},

  { path: '/PendingRequest', name:'PendingRequest', element: <ProtectedRoute><PendingRequest /></ProtectedRoute>},

  
  { path: '/freightaudit', name:'FreightAudit', element: <ProtectedRoute><FreightAudit /></ProtectedRoute> },
  { path: '/financialanalytics', name:'FreightAudit', element: <ProtectedRoute><FinancialAnalytics /></ProtectedRoute> },
  { path: '/invoice', name:'FreightAudit', element: <ProtectedRoute><Invoice /></ProtectedRoute> },

  { path: '/vehicles', name:'Vehicles' , element: <ProtectedRoute><Vehicles/></ProtectedRoute>},
  
  { path: '/shipment', name: 'Shipment', element: <ProtectedRoute><Shipment /></ProtectedRoute> },
  { path: '/insight', name: 'Insight', element: <ProtectedRoute><Insight/></ProtectedRoute>},
  { path: '/insShipment', name: 'Insight', element: <ProtectedRoute><Shipment_insight/></ProtectedRoute>},
  { path: '/insCost', name: 'Insight', element: <ProtectedRoute><Cost_insight/></ProtectedRoute>},
  { path: '/insItem', name: 'Insight', element: <ProtectedRoute><Item_insight/></ProtectedRoute>},
  { path: '/insWeight', name: 'Insight', element: <ProtectedRoute><Weight_insight/></ProtectedRoute>},

  
  { path: '/button', name:'button', element: <ProtectedRoute><Button /></ProtectedRoute>},
  { path: '/Toasts', name: 'Toasts', element: <ProtectedRoute><Toast /></ProtectedRoute> },
];

export default routes;