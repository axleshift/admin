// permissionConfigAdmin.js
const accessPermissions = {
    admin: {
      HR: ['/hrdash', '/worker', '/jobposting', '/payroll', '/hr3leaverequest'],
      Core: ['/coredash', '/shipment', '/insight', ],
      Finance: ['/financedash', '/monthly'  ],
      Logistics: ['/logisticdash', '/vehicles'],
      Administrative: ['/employeedash', '/restore', '/registernew', '/PendingRequest', '/AccessReview',]
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };