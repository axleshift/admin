  import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

  // Define the base API with RTK Query
  export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
    reducerPath: "adminApi",
    tagTypes: ["User", "Products", "Customers", "Workers", "Shipping", "Employees"], 
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
      // Log user activity
      logUserActivity: build.mutation({
        query: (activityData) => ({
          url: 'user-activity', // Adjust to your endpoint
          method: 'POST',
          body: activityData,
        }),
        invalidatesTags: ["User"], 
      }),
      // Update user details
      updateUser: build.mutation({
        query: ({ id, ...userDetails }) => ({
          url: `general/user/${id}`, // Adjust the endpoint as needed
          method: "PUT", // Or PATCH, depending on your API
          body: userDetails,
        }),
        invalidatesTags: ["User"], // Adjust if you need to refetch user data
      }),

      getEmployees: build.query({
        query: () => 'hr1/employee', // This should match your backend route for fetching all employees
        providesTags: ["Employees"],
    }),
      

    }),
  });

  export const {
    useGetUserQuery,
    useGetProductsQuery,
    useGetCustomersQuery,
    useGetWorkersQuery,
    useChangeRoleMutation,
    useFireUserMutation,
    useGetShippingQuery,
    useCreateShippingMutation,
    useUpdateShippingMutation,
    useDeleteShippingMutation,
    useLogUserActivityMutation,
    useUpdateUserMutation,
    useGetEmployeesQuery,
  } = api;
