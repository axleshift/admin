// permissionConfigManager.js
const accessPermissions = {
    Manager: {
      HR: ['/hrdash', '/worker', '/jobposting'],
      Core: ['/coredash', '/customer', '/monthly', '/daily', '/breakdown', '/shipment',],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics',],
      Logistic: ['/logisticdash', '/logistic1/index', '/logistic1/pin',],
      Administrative: ['/employeedash', '/useractivity/index',]
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };