import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const userDepartment = sessionStorage.getItem('department');
  const navigate = useNavigate()

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => route.path === pathname)
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        })
      return currentPathname
    })
    return breadcrumbs
  }

  // Department-sensitive navigation handler
  const handleDepartmentNavigation = () => {
    if (!userDepartment) {
      navigate("/dashboard")
      return
    }

    switch (userDepartment?.toLowerCase()) {
      case "administrative":
        navigate("/employeedash");
        break;
      case "hr":
        navigate("/hrdash");
        break;
      case "core":
        navigate("/coredash");
        break;
      case "finance":
        navigate("/financedash");
        break;
      case "logistics":
        navigate("/logisticdash");
        break;
      default:
        navigate("/dashboard"); 
    }
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem 
        href="#" 
        onClick={(e) => {
          e.preventDefault()
          handleDepartmentNavigation()
        }}
      >
        Home
      </CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)