// permissionConfigManager.js
const accessPermissions = {
    Manager: {
      HR: ['/hrdash', '/worker', '/jobposting', '/profile', '/Settings', '/changepass'],
      Core: ['/coredash', '/customer', '/monthly', '/daily', '/breakdown', '/shipment', '/profile', '/Settings', '/changepass'],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics', '/profile', '/Settings', '/changepass'],
      Logistic: ['/logisticdash', '/logistic1/index', '/logistic1/pin', '/profile', '/Settings', '/changepass'],
      Administrative: ['/employeedash', '/useractivity/index', '/profile', '/Settings', '/changepass']
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };