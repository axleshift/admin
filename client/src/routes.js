// routes.js
import React from 'react';

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Worker = React.lazy(() => import('./views/worker/works'));
const Customers = React.lazy(() => import('./views/customers/index'));
const Index = React.lazy(() => import('./views/product'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Profile = React.lazy(() => import('./views/pages/profile/Profile'));
const AddCustomer = React.lazy(() => import('./views/customers/add')); 
const Land = React.lazy(() => import('./views/pages/freight/land'));
const transaction = React.lazy(() => import('./views/pages/freight/transaction'));
const shipping = React.lazy(() => import('./views/pages/freight/shipping'));
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/product', name: 'Product', element: Index },
  { path: '/customer', name: 'Customer', element: Customers },
  { path: '/add', name: 'Add Customer', element: AddCustomer }, 
  { path: '/worker', name: 'Employees', element: Worker },
  { path: '/profile', name: 'Profile Page', element: Profile },
  { path: '/freight/land', name: 'Freight Land', element: Land },
  { path: '/freight/transaction', name: 'Freight transaction', element: transaction },
  { path: '/freight/shipping', name: 'Freight shipping', element: shipping },
];

export default routes;
