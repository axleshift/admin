// permissionConfigAdmin.js
const accessPermissions = {
    admin: {
      HR: ['/hrdash', '/worker', '/jobposting', '/payroll', '/freight/transaction'],
      Core: ['/coredash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown'],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics', '/invoice'],
      Logistics: ['/logisticdash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown', '/logistic1/index', '/logistic1/pin'],
      Administrative: ['/employeedash', '/restore', '/registernew', '/PendingRequest', '/AccessReview',]
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };