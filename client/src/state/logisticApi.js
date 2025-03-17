import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const logisticApi = createApi({ 
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "logisticApi", 
  tagTypes: [
    
], 
  endpoints: (build) => ({
    getLogistics: build.query({
        query: () => 'logix/logistic',  
        providesTags: ['Logistics'],
      }),
      getLogisticsById: build.query({
        query: (id) => `logix/logistic/${id}`, 
        providesTags: ['Logistics'],
      }),
      getLogisticsByTrackingNum: build.query({
        query: (trackingNumber) => ({
          url: `logix/logistic/track`, 
          method: 'POST',
          body: { trackingNumber },
        }),
        providesTags: ['Logistics'],
      }),
      updateLogistics: build.mutation({
        query: ({ id, currentLocation }) => ({
          url: `logix/logistic/${id}`, 
          method: "PUT",
          body: { currentLocation },
        }),
        invalidatesTags: ["Logistics"],
      }),
      deleteLogistics: build.mutation({
        query: (id) => ({
          url: `logix/logistic/${id}`, 
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
 } = logisticApi; 