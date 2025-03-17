// permissionConfigSuperadmin.js
const accessPermissions = {
    superadmin: {
      HR: [
        '/employeedash', '/hrdash', '/financedash', '/coredash', '/logisticdash',
        '/worker', '/jobposting', '/payroll', '/freight/transaction', '/oversales',
        '/customer', '/monthly', '/daily', '/breakdown', '/useractivity/index',
        '/announce', '/restore', '/tack', '/recovery', '/Toasts', '/chatbox',
        '/invoice', '/registernew', '/PendingRequest', '/AccessReview',
        '/freightaudit', '/financialanalytics', '/shipment', '/logistic1/index',
        '/logistic1/pin', '/profile', '/Settings', '/changepass'
      ],
      Core: [
        '/employeedash', '/hrdash', '/financedash', '/coredash', '/logisticdash',
        '/worker', '/jobposting', '/payroll', '/freight/transaction', '/oversales',
        '/customer', '/monthly', '/daily', '/breakdown', '/useractivity/index',
        '/announce', '/restore', '/tack', '/recovery', '/Toasts', '/chatbox',
        '/shipment', '/profile', '/Settings', '/changepass'
      ],
      Logistic: [
        '/employeedash', '/hrdash', '/financedash', '/coredash', '/logisticdash',
        '/worker', '/jobposting', '/payroll', '/freight/transaction', '/oversales',
        '/customer', '/monthly', '/daily', '/breakdown', '/useractivity/index',
        '/announce', '/restore', '/tack', '/recovery', '/Toasts', '/chatbox',
        '/logistic1/index', '/logistic1/pin', '/profile', '/Settings', '/changepass'
      ],
      Finance: [
        '/employeedash', '/hrdash', '/financedash', '/coredash', '/logisticdash',
        '/worker', '/jobposting', '/payroll', '/freight/transaction', '/oversales',
        '/customer', '/monthly', '/daily', '/breakdown', '/useractivity/index',
        '/announce', '/restore', '/tack', '/recovery', '/Toasts', '/chatbox',
        '/freightaudit', '/financialanalytics', '/invoice', '/profile', '/Settings', '/changepass'
      ],
      Administrative: [
        '/employeedash', '/hrdash', '/financedash', '/coredash', '/logisticdash',
        '/worker', '/jobposting', '/payroll', '/freight/transaction', '/oversales',
        '/customer', '/monthly', '/daily', '/breakdown', '/useractivity/index',
        '/announce', '/restore', '/tack', '/recovery', '/Toasts', '/chatbox',
        '/recoverytuts', '/registernew', '/PendingRequest', '/AccessReview',
        '/monitoring', '/profile', '/Settings', '/changepass', '/freightaudit',
        '/financialanalytics', '/invoice', '/shipment', '/settings', '/request',
        '/logistic1/index', '/usermanagement', '/cron'
      ]
    }
  };
  
  // Pages that are always permitted
  const alwaysPermitted = ['/profile', '/Settings', '/changepass', '/button', '/request'];
  
  export { accessPermissions, alwaysPermitted };