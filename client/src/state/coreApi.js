import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coreApi = createApi({ 
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "coreApi", 
  tagTypes: [
    
], 
  endpoints: (build) => ({
    getShipments: build.query({
        query: () => "core/shipment",
      }),
  }),
});

export const { 
    useGetShipmentsQuery,
} = coreApi; 