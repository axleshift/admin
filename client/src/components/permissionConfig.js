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
        '/logistic1/index','./usermanagement'
      ]
    },
    admin: {
      HR: ['/hrdash', '/worker', '/jobposting', '/payroll', '/profile', '/Settings', '/changepass', '/request'],
      Core: ['/coredash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown', '/profile', '/Settings', '/changepass'],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics', '/invoice', '/profile', '/Settings', '/changepass'],
      Logistics: ['/logisticdash', '/shipment', '/customer', '/monthly', '/daily', '/breakdown', '/logistic1/index', '/logistic1/pin', '/profile', '/Settings', '/changepass'],
      Administrative: ['/employeedash', '/useractivity/index', '/restore', '/registernew', '/PendingRequest', '/AccessReview', '/profile', '/Settings', '/changepass']
    },
    Manager: {
      HR: ['/hrdash', '/worker', '/jobposting', '/profile', '/Settings', '/changepass'],
      Core: ['/coredash', '/customer', '/monthly', '/daily', '/breakdown', '/shipment', '/profile', '/Settings', '/changepass'],
      Finance: ['/financedash', '/freight/transaction', '/oversales', '/freightaudit', '/financialanalytics', '/profile', '/Settings', '/changepass'],
      Logistic: ['/logisticdash', '/logistic1/index', '/logistic1/pin', '/profile', '/Settings', '/changepass'],
      Administrative: ['/employeedash', '/useractivity/index', '/profile', '/Settings', '/changepass']
    }
  };
  
  // Pages that are **always permitted**
  const alwaysPermitted = ['/profile', '/Settings', '/changepass'];
  
  export { accessPermissions, alwaysPermitted };
  