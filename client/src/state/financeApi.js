import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financeApi = createApi({ // ✅ Changed to lowercase to match imports in store.js
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "financeApi", // ✅ Updated to lowercase for consistency
  tagTypes: [
   
], // ✅ Fixed spelling
  endpoints: (build) => ({
    getFreightAudits: build.query({
        query: () => 'finance/getfreightaudit',
      }),
      getFreightInvoice: build.query({
        query: () => 'finance/invoices',
      }),
      getSales: build.query({
        query: () => 'sales/sales',
        providesTags: ['Sales'],
      }),

  }),
});

export const { 
    useGetFreightAuditsQuery,
    useGetFreightInvoiceQuery,
    useGetSalesQuery,
  
} = financeApi; // ✅ Export hook correctly