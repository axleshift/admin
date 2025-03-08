import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base API with RTK Query
export const adminApi = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL ,
    credentials: 'include',}),
  
  reducerPath: "adminApi",
  tagTypes: [
    "User", 
    "Products", 
    "Customers", 
    "Workers", 
    "Generate",
    "Freight", 
    "Employees", 
    "Logistics",
    "ActivityLogs",
    'Sales',
    'Dashboard',
    "Notif",
    "Backup",
  ],
  endpoints: (build) => ({
    // Fetch user data by ID
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
//fix
    loginUser: build.mutation({
      query: ({ identifier, password }) => ({
        url: "client/login",
        method: "POST",
        body: { identifier, password },
      }),
    }),
    changePassword: build.mutation({
      query: (credentials) => ({
        url: 'client/change-password',
        method: 'PUT',
        body: credentials,
      }),
    }),
    postForgotPassword: build.mutation({
      query: (email) => ({
        url: 'general/forgot-password', 
        method: 'POST',
        body: { email },
      }),
    }),

    registerUser: build.mutation({
      query: (userData) => ({
        url: '/client/register',
        method: 'POST',
        body: userData,
      }),
    }),

  //admin
  getPermissions: build.query({
    query: () => "general/permissions", // API endpoint
  }),


  setBackupDirectory: build.mutation({
    query: (data) => ({
      url: 'set-directory',
      method: 'POST',
      body: data,
    }),
  }),
  backupDatabase: build.mutation({
    query: () => ({
      url: 'backup',
      method: 'POST',
    }),
  }),
  restoreDatabase: build.mutation({
    query: (data) => ({
      url: 'restore',
      method: 'POST',
      body: data,
    }),
  }),
  listBackups: build.query({
    query: () => 'list-backups',
  }),
  listCollections: build.query({
    query: (backupName) => `list-collections/${backupName}`,
  }),

  getUserActivity: build.query({
    query: () => 'admin/user-activity',
  }),
  getUserPermissions: build.query({
      query: (userId) => `hr/user/permissions/${userId}`,
    }),

  resetPassword: build.mutation({
      query: ({ id, token, password }) => ({
        url: `/general/reset-password/${id}/${token}`,
        method: 'POST',
        body: { password },
      }),
  }),

  //access request
  getDepartmentMessages: build.query({
    query: ({ department, role }) => 
      `/admin/getmessages/${department}?role=${role}`, // GET Request
  }),
  updateMessageStatus: build.mutation({
    query: ({ id, status, responderUsername }) => ({
      url: `/admin/messages/${id}/status`,
      method: "PUT",
      body: { status, responderUsername },
    }),
  }),
  sendMessage: build.mutation({
    query: (messageData) => ({
      url: "/admin/sendmessage",
      method: "POST",
      body: messageData,
    }),
  }),
 
  //request 
  getRequests: build.query({
    query: () => '/general/requests',
    providesTags: ['Requests']
  }),
  
  
  // Receive a request (create or update)
  receiveRequest: build.mutation({
    query: (requestData) => ({
      url: '/general/receive-request',
      method: 'POST',
      body: requestData,
    }),
    invalidatesTags: ['Requests']
  }),
  
  sendRequest: build.mutation({
    query: (requestData) => ({
      url: '/general/send-request', // Removed 'general' since backend doesn't have it
      method: 'POST',
      body: requestData,
    }),
    invalidatesTags: ['Requests']
  }),

  //security
  getSecurityAlerts: build.query({
    query: (params = {}) => ({
      url: 'security/security-alert',
      params
    })
  }),
  getLoginAttempts: build.query({
    query: (params = {}) => ({
      url: 'security/login-attemp',
      params
    })
  }),


    getPerformance: build.query({
      query: () => 'hr/performance',
    }),
 
 generateOTP: build.mutation({
       query: (email) => ({
         url: '/client/unlock-request',
         method: 'POST',
         body: { email }
       })
     }),
     // Endpoint to verify OTP
     verifyOTP: build.mutation({
       query: (data) => ({
         url: '/client/unlock-verify',
         method: 'POST',
         body: data
       })
     }),
    
    


    getShipping: build.query({
      query: (params) => {
        const { customerId, product } = params || {};
        return `sales/shipping${
          customerId || product ? `?customerId=${customerId}&product=${product}` : ''
        }`;
      },
      providesTags: ["Shipping"],
    }),
    // Create new shipping entry
    createShipping: build.mutation({
      query: (newShipping) => ({
        url: `sales/shipping`,
        method: "POST",
        body: newShipping,
      }),
      invalidatesTags: ["Shipping"],
    }),
    // Update a shipping entry
    updateShipping: build.mutation({
      query: ({ id, ...shipping }) => ({
        url: `sales/shipping/${id}`, // Correct endpoint for updating
        method: "PATCH",
        body: shipping,
      }),
      invalidatesTags: ["Shipping"], // Invalidate shipping tag to refetch data
    }),
    // Delete a shipping entry
    deleteShipping: build.mutation({
      query: (id) => ({
        url: `sales/shipping/${id}`, // Correct endpoint for deleting
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"], // Invalidate shipping tag to refetch data
    }),

    // Update user details
    updateUser: build.mutation({
      query: ({ id, ...userDetails }) => ({
        url: `general/user/${id}`,
        method: "PUT",
        body: userDetails,
      }),
      invalidatesTags: ["User"],
    }),
   


    
    

    getDashboard: build.query({
      query: () => 'general/dashboard',
      providesTags: ['Dashboard'],
    }),

    getNotif: build.query({
      query: () => 'notification/getnotif',
      providesTags: ['Notif'],
    }),
    postNotif: build.mutation({
      query: (newNotif) => ({
        url: `notification/postnotif`,
        method: "POST",
        body: newNotif,
      }),
      invalidatesTags: ["Notif"],
    }),

    // Integration
     


    postBackup: build.mutation({
      query: ({ backupDir }) => ({
        url: 'admin/backup',
        method: 'POST',
        body: { backupDir },
      }),
    }),
    postRestore: build.mutation({
      query: ({ timestamp, filename, databaseName, directoryPath }) => ({
        url: 'admin/restore',
        method: 'POST',
        body: { timestamp, filename, databaseName, directoryPath },
      }),
    }),
   postsetDirectory: build.mutation({
    query: ({ directoryPath }) => ({
      url: 'admin/set-directory',
      method: 'POST',
      body: { directoryPath },
    }),
   }),

    
    
  
 

    posttryBackup: build.mutation({
      query: () => ({
        url: 'try/backup',
        method: 'POST',
      }),
    }),
    posttryRestore: build.mutation({
      query: ({ timestamp, filename, databaseName }) => ({ 
        url: 'try/restore',
        method: 'POST',
        body: { timestamp, filename, databaseName },  
      }),
    }),
    posttrySave: build.mutation({
      query: ({ directoryPath }) => ({
        url: 'try/save-directory',
        method: 'POST',
        body: { directoryPath },
      }),
    }),


  
    
  }),

});

// Export the hooks generated by RTK Query
export const {
  useGetUserQuery,
  //fix
  useLoginUserMutation,
  useChangePasswordMutation,
  useRegisterUserMutation,
  
//admin
useGetPermissionsQuery,
useSetBackupDirectoryMutation,
useBackupDatabaseMutation,
useRestoreDatabaseMutation,
useListBackupsQuery,
useListCollectionsQuery,

useGetUserActivityQuery,
useGetUserPermissionsQuery, 
useResetPasswordMutation,
useGetLogsQuery,
//securtity
useGetSecurityAlertsQuery, 
useGetLoginAttemptsQuery ,
useGenerateOTPMutation, 
useVerifyOTPMutation,

useGetRequestsQuery,
useReceiveRequestMutation, 
useSendRequestMutation,

//access request
useGetDepartmentMessagesQuery, 
useUpdateMessageStatusMutation,
useSendMessageMutation ,



//finance


 
 
  useGetPerformanceQuery,
 
  useGetShippingQuery,
  useCreateShippingMutation,
  useUpdateShippingMutation,
  useDeleteShippingMutation,
  useUpdateUserMutation,
 
  useGetDashboardQuery,
  useGetNotifQuery,
  usePostNotifMutation,

  usePostBackupMutation,
  usePostRestoreMutation ,
  usePostsetDirectoryMutation,


  usePostForgotPasswordMutation,



  usePosttryBackupMutation,
  usePosttryRestoreMutation,
  usePosttrySaveMutation,

} = adminApi;


