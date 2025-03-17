import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financeApi = createApi({ 
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
    credentials: 'include',
  }),
  reducerPath: "financeApi", 
  tagTypes: [
   
], 
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
      getCustomers: build.query({
        query: () => `client/customers/`,
        providesTags: ["Customers"],
      }),

  }),
});

export const { 
    useGetFreightAuditsQuery,
    useGetFreightInvoiceQuery,
    useGetSalesQuery,
    useGetCustomersQuery,
  
} = financeApi; 