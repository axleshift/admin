import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coreApi = createApi({ // ✅ Changed to lowercase to match imports in store.js
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "coreApi", // ✅ Updated to lowercase for consistency
  tagTypes: [
    
], // ✅ Fixed spelling
  endpoints: (build) => ({
    getShipments: build.query({
        query: () => "core/shipment",
      }),
  }),
});

export const { 
    useGetShipmentsQuery,
} = coreApi; // ✅ Export hook correctly