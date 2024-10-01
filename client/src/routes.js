import React from 'react';

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const worker = React.lazy(() => import('./views/worker/works'));
const customers = React.lazy(() => import('./views/customers/index'));
const index = React.lazy(() => import('./views/product'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Profile = React.lazy(() => import('./views/pages/profile/Profile'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/product', name: 'Product', element: index },
  { path: '/customer', name: 'Customer', element: customers },
  { path: '/worker', name: 'Employees', element: worker },  
  { path: "/profile", name: "Profile Page", element: Profile },
];

export default routes;
