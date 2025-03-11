import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hrApi = createApi({ // ✅ Changed to lowercase to match imports in store.js
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "hrApi", // ✅ Updated to lowercase for consistency
  tagTypes: ["Workers"], // ✅ Fixed spelling
  endpoints: (build) => ({
    getNewUser:build.query({
      query: () => "hr/newUser",
      invalidatesTags: [],
    }),

    gethrdash: build.query({
        query: () => 'hr/hrdash',
        providesTags: ['Dashboard'],
      }),
    getWorkers: build.query({
      query: () => "hr/worker/",
      providesTags: ["Workers"],
    }),
    changeRole: build.mutation({
        query: ({ userId, newRole }) => ({
          url: `hr/worker/${userId}/role`,
          method: "PUT",
          body: { newRole },
        }),
        invalidatesTags: ["Workers"],
      }),
    fireUser: build.mutation({
        query: ({ userId }) => ({
          url: `hr/worker/${userId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Workers"],
    }),
    postgenerate: build.mutation({
        query: (userId) => ({
          url: `hr/generate/${userId}`, // Correctly matches the backend route
          method: 'POST',
        }),
        invalidatesTags: ['Generate'],
      }),
    //integration
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
    getJobPostings: build.query({
        query: () => 'hr/job-posting',
      }),
    getJobPostingById: build.query({
        query: (id) => `hr/job-postings/${id}`, 
      }),
    getpayroll:build.query({
        query: (id) => `hr/payroll`,
      }),
    getUserPermissions: build.query({
        query: (userId) => ({
          url: `hr/permissions/${userId}`,
          method: 'GET'
        }),
          
      }),
    grantAccess: build.mutation({
        query: (body) => ({
          url: 'hr/grant-access',
          method: 'POST',
          body
        }),
        invalidatesTags: (result, error, { userId }) => 
          error ? [] : [{ type: 'UserPermissions', id: userId }]
      }),
    revokeAccess: build.mutation({
        query: (body) => ({
          url: 'hr/revoke-access',
          method: 'POST',
          body
        }),
        invalidatesTags: (result, error, { userId }) => 
          error ? [] : [{ type: 'UserPermissions', id: userId }]
      })  ,
      
  }),
});

export const { 
    useGetNewUserQuery,
    useGethrdashQuery,
    useGetWorkersQuery ,
    usePostgenerateMutation,
    useChangeRoleMutation,
    useFireUserMutation,
    usePostToHrMutation,
    usePostToFinanceMutation,
    usePostToCoreMutation,
    usePostToLogisticsMutation,
    useGetJobPostingsQuery, 
    useGetJobPostingByIdQuery,
    useGetpayrollQuery,
    useGetUserPermissionsQuery,
    useGrantAccessMutation,
    useRevokeAccessMutation,
} = hrApi; // ✅ Export hook correctly
