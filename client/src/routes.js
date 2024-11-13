import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/employeedash'))
const Worker = React.lazy(() => import('./views/worker/works'))
const Performance = React.lazy(() => import('./views/worker/perform'))
const Customers = React.lazy(() => import('./views/customers/index'))
const Index = React.lazy(() => import('./views/product'))
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))
const AddCustomer = React.lazy(() => import('./views/customers/add'))
const Land = React.lazy(() => import('./views/pages/freight/land'))
const transaction = React.lazy(() => import('./views/pages/freight/transaction'))
const shipping = React.lazy(() => import('./views/pages/freight/shipping'))

//sales
const sales = React.lazy(()=> import ('./views/pages/sales/oversales'))
const daily = React.lazy(()=> import ('./views/pages/sales/daily.js'))
const monthly = React.lazy(()=> import ('./views/pages/sales/monthly'))
const breakdown = React.lazy(()=> import ('./views/pages/sales/breakdown'))

const activity = React.lazy(() => import('./views/pages/useractivity/index'))

const Settings = React.lazy(() => import('./views/pages/profile/Settings'))
const changepass = React.lazy(() => import('./views/pages/profile/changepass'))


//logistic 
const logistic1 = React.lazy(() => import('./views/pages/logistic1/index'))
const pin = React.lazy(() => import('./views/pages/logistic1/pin.js'))



const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/employeedash', name: 'Dashboard', element: Dashboard },
  { path: '/product', name: 'Product', element: Index },
  { path: '/customer', name: 'Customer', element: Customers },
  { path: '/add', name: 'Add Customer', element: AddCustomer },
  { path: '/worker', name: 'Employees', element: Worker },
  { path: '/perform', name: 'Employees Performance', element: Performance },
  { path: '/profile', name: 'Profile Page', element: Profile },
  { path: '/freight/land', name: 'Freight Land', element: Land },
  { path: '/freight/transaction', name: 'Freight transaction', element: transaction },
  { path: '/freight/shipping', name: 'Freight shipping', element: shipping },
  { path: '/useractivity/index', name: 'ACTIVITY', element: activity },

  { path: '/Settings', name: 'Settings', element: Settings },
  { path: '/changepass', name: 'ChangePassword', element: changepass },

  { path: '/oversales', name: 'Oversales', element:sales},
  { path: '/monthly', name: 'Monthly', element:monthly},
  { path: '/daily', name: 'Daily', element:daily},
  { path: '/breakdown', name: 'Breakdown ', element:breakdown},
  

  { path: '/logistic1/index', name: 'OPERATIONAL', element: logistic1 },
  { path: '/logistic1/pin', name: 'Track', element: pin },
]



export default routes
