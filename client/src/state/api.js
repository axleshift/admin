import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base API with RTK Query
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
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
    "Backup"
  ],
  endpoints: (build) => ({
    // Fetch user data by ID
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    // Fetch all products
    getProducts: build.query({
      query: () => `client/products`,
      providesTags: ["Products"],
    }),
    // Fetch all customers
    getCustomers: build.query({
      query: () => `client/customers/`,
      providesTags: ["Customers"],
    }),
    // Fetch all workers
    getWorkers: build.query({
      query: () => `client/worker/`,
      providesTags: ["Workers"],
    }),

    postgenerate: build.mutation({
      query: (userId) => ({
        url: `client/generate/${userId}`, // Correctly matches the backend route
        method: 'POST',
      }),
      invalidatesTags: ['Generate'],
    }),
    getPerformance: build.query({
      query: () => 'client/performance',
    }),

    // Change role of a worker
    changeRole: build.mutation({
      query: ({ userId, newRole }) => ({
        url: `client/worker/${userId}/role`,
        method: "PUT",
        body: { newRole },
      }),
      invalidatesTags: ["Workers"],
    }),
    // Fire (delete) a user
    fireUser: build.mutation({
      query: ({ userId }) => ({
        url: `client/worker/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workers"],
    }),
    // Fetch shipping data with optional parameters
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

    // Logistics queries and mutations
    getLogistics: build.query({
      query: () => 'logix/logistic',  // Fetch all logistics
      providesTags: ['Logistics'],
    }),
    getLogisticsById: build.query({
      query: (id) => `logix/logistic/${id}`, // Fetch logistics by ID
      providesTags: ['Logistics'],
    }),
    getLogisticsByTrackingNum: build.query({
      query: (trackingNumber) => ({
        url: `logix/logistic/track`, // Fetch logistics by tracking number
        method: 'POST',
        body: { trackingNumber },
      }),
      providesTags: ['Logistics'],
    }),
    updateLogistics: build.mutation({
      query: ({ id, currentLocation }) => ({
        url: `logix/logistic/${id}`, // Update logistics
        method: "PUT",
        body: { currentLocation },
      }),
      invalidatesTags: ["Logistics"],
    }),
    deleteLogistics: build.mutation({
      query: (id) => ({
        url: `logix/logistic/${id}`, // Delete logistics
        method: "DELETE",
      }),
      invalidatesTags: ["Logistics"],
    }),
    getSales: build.query({
      query: () => 'sales/sales',
      providesTags: ['Sales'],
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
      postToHr: build.mutation({
        query: ({ department, payload }) => ({
          url: `management/hr`,
          method: "POST",
          body: payload,
        }),
      }),
    postToFinance: build.mutation({
      query: ({ department, payload }) => ({
        url: `management/finance`,
        method: "POST",
        body: payload,
      }),
    }),
    postToCore: build.mutation({
      query: ({ department, payload }) => ({
        url: `management/core`,
        method: "POST",
        body: payload,
      }),
    }),
    postToLogistics: build.mutation({
      query: ({ department, payload }) => ({
        url: `management/logistics`,
        method: "POST",
        body: payload,
      }),
    }),
    postBackup: build.mutation({
      query: () => ({
        url: 'management/backup',
        method: 'POST',
      }),
    }),
    postRestore: build.mutation({
      query: (timestamp) => ({
        url: 'management/restore',
        method: 'POST',
        body: { timestamp },  
      }),
    }),
  }),
});

// Export the hooks generated by RTK Query
export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetWorkersQuery,
  usePostgenerateMutation,
  useGetPerformanceQuery,
  useChangeRoleMutation,
  useFireUserMutation,
  useGetShippingQuery,
  useCreateShippingMutation,
  useUpdateShippingMutation,
  useDeleteShippingMutation,
  useUpdateUserMutation,
  useGetLogisticsQuery,
  useGetLogisticsByIdQuery,
  useGetLogisticsByTrackingNumQuery,
  useUpdateLogisticsMutation,
  useDeleteLogisticsMutation,
  useGetSalesQuery,
  useGetDashboardQuery,
  useGetNotifQuery,
  usePostNotifMutation,

  usePostBackupMutation,
  usePostRestoreMutation ,

  usePostToHrMutation,
  usePostToFinanceMutation,
  usePostToCoreMutation,
  usePostToLogisticsMutation,
} = api;
