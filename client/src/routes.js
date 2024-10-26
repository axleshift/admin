import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Worker = React.lazy(() => import('./views/worker/works'))
const Customers = React.lazy(() => import('./views/customers/index'))
const Index = React.lazy(() => import('./views/product'))
const Profile = React.lazy(() => import('./views/pages/profile/Profile'))
const AddCustomer = React.lazy(() => import('./views/customers/add'))
const Land = React.lazy(() => import('./views/pages/freight/land'))
const transaction = React.lazy(() => import('./views/pages/freight/transaction'))
const shipping = React.lazy(() => import('./views/pages/freight/shipping'))

const activity = React.lazy(() => import('./views/pages/useractivity/index'))

const Settings = React.lazy(() => import('./views/pages/profile/Settings'))
const changepass = React.lazy(() => import('./views/pages/profile/changepass'))

//hr1
const employee = React.lazy(() => import('./views/pages/hr1/EmployeeManagement')) 

//h2/2
// const post = React.lazy(() => import('./views/pages/hr2/jobpost'))
// const interview = React.lazy(() => import('./views/pages/hr2/interview'))
// const application= React.lazy(() => import('./views/pages/hr2/application'))

//logistic 
const performance = React.lazy(() => import('./views/pages/hr1/PerformanceManagement')) 
const logistic1 = React.lazy(() => import('./views/pages/logistic1/index'))
const pin = React.lazy(() => import('./views/pages/logistic1/pin.js'))



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
  { path: '/useractivity/index', name: 'ACTIVITY', element: activity },

  { path: '/Settings', name: 'Settings', element: Settings },
  { path: '/changepass', name: 'ChangePassword', element: changepass },

  { path: '/hr1/EmployeeManagement', name: 'EMPLOYEE DETAILS', element: employee },
  { path: '/hr1/PerformanceManagement', name: 'PERFORMANCE DETAILS', element: performance},
  // { path: '/hr2/jobpost', name:'JOBPOST', element: post },
  // { path: '/hr2/interview', name:'INTERVIEW', element: interview },
  // { path: '/hr2/application', name:'APPLICATION', element: application },

  { path: '/logistic1/index', name: 'OPERATIONAL', element: logistic1 },
  { path: '/logistic1/pin', name: 'Track', element: pin },
]



export default routes
