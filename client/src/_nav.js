import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilBoatAlt,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDollar,
  cilDrop,
  cilLocationPin,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilShieldAlt,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
//    {
//   component: CNavTitle,
//    name: 'Theme',
// },
//  {
//    component: CNavItem,
//     name: 'Colors',
//    to: '/theme/colors',
//    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
//  },
//  {
//      component: CNavItem,
//      name: 'Typography',
//    to: '/theme/typography',
//    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
// },
  
  {
    component: CNavTitle,
    name: 'SERVICES',
  },
  {
    component: CNavItem,
    name: 'Products',
    to: '/product',
  },
  {
    component: CNavItem,
    name: 'Customers',
    to: '/customer',
  },
  {
    component: CNavItem,
    name: 'Employees',
    to:'/worker'
  },


 
  {
    component: CNavGroup,
    name: 'FREIGHT',
    to: '/product',
    icon: <CIcon icon={cilBoatAlt} customClassName="nav-icon" />,
    items: [
      
      {
        component: CNavItem,
        name: 'LandFreight',
        to: '/product/land',
      },
      {
        component: CNavItem,
        name: 'AirFreight',
        to: '/product/air',
      },
      
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Account',
  //   to: '/pages',
  //   icon: <CIcon icon={cilBoatAlt} customClassName="nav-icon" />,
  //   items: [
      
  //     {
  //       component: CNavItem,
  //       name: 'Register',
  //       to: '/register',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Login',
  //       to: '/login',
  //     },
      
  //   ],
  // },
  
  {
    component: CNavItem,
    name: 'Track',
    to: '/track',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
   
    
  },
  {
    component: CNavItem,
    name: 'Pricing',
    to: '/pricing',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
   
    
  },
  {
    component: CNavTitle,
    name: 'Security',
  },
  {
    component: CNavGroup,
    name: 'Threat',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Form Control',
        to: '/forms/form-control',
      },
      {
        component: CNavItem,
        name: 'Select',
        to: '/forms/select',
      },
      
    ],
    
  },

  // {
  //   component: CNavItem,
  //   name: 'Charts',
  //   to: '/charts',
  //   icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Icons',
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Free',
  //       to: '/icons/coreui-icons',
  //       badge: {
  //         color: 'success',
  //         text: 'NEW',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Flags',
  //       to: '/icons/flags',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Brands',
  //       to: '/icons/brands',
  //     },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Notifications',
  //   icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Alerts',
  //       to: '/notifications/alerts',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Badges',
  //       to: '/notifications/badges',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Modal',
  //       to: '/notifications/modals',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Toasts',
  //       to: '/notifications/toasts',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Widgets',
  //   to: '/widgets',
  //   icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  //   badge: {
  //     color: 'info',
  //     text: 'NEW',
  //   },
  // },
  // {
  //   component: CNavTitle,
  //   name: 'Extras',
  // },
 {
   component: CNavGroup,
   name: 'Pages',
   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
   items: [
     {
      component: CNavItem,
         name: 'Login',
       to: '/login',
     },
        {
        component: CNavItem,
         name: 'Register',
         to: '/register',
   },
//     {
//         component: CNavItem,
//          name: 'Error 404',
//        to: '/404',
//       },
//      {
//        component: CNavItem,
//         name: 'Error 500',
//       to: '/500',
//      },
 ],
 },
  // {
  //   component: CNavItem,
  //   name: 'Docs',
  //   href: 'https://coreui.io/react/docs/templates/installation/',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav
