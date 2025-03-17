// permissionConfigAdmin.js
const accessPermissions = {
    admin: {
      HR: ['/hrdash', '/worker', '/jobposting', '/payroll', '/profile', '/Settings', '/changepass', '/request', '/freight/transaction'],
      Core: ['/coredash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown', '/profile', '/Settings', '/changepass'],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics', '/invoice', '/profile', '/Settings', '/changepass'],
      Logistics: ['/logisticdash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown', '/logistic1/index', '/logistic1/pin', '/profile', '/Settings', '/changepass'],
      Administrative: ['/employeedash', '/useractivity/index', '/restore', '/registernew', '/PendingRequest', '/AccessReview', '/profile', '/Settings', '/changepass', '/cron']
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };