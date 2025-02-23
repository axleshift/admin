import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const logisticApi = createApi({ // ✅ Changed to lowercase to match imports in store.js
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "logisticApi", // ✅ Updated to lowercase for consistency
  tagTypes: [
    
], // ✅ Fixed spelling
  endpoints: (build) => ({
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
  
  }),
});

export const { 
    useGetLogisticsQuery,
    useGetLogisticsByIdQuery,
    useGetLogisticsByTrackingNumQuery,
    useUpdateLogisticsMutation,
    useDeleteLogisticsMutation,
 } = logisticApi; // ✅ Export hook correctly