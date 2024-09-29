import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_APP_BASE_URL }),
  reducerPath: "adminApi",
  tagTypes: ["User", "Products", "Customers", "Workers"],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    getProducts: build.query({
      query: () => `client/products`,
      providesTags: ["Products"],
    }),
    getCustomers: build.query({
      query: () => `client/customers/`,
      providesTags: ["Customers"],
    }),
    getWorkers: build.query({
      query: () => `client/worker/`,
      providesTags: ["Workers"],
    }),
    // Mutation to change the role of a worker
    changeRole: build.mutation({
      query: ({ userId, newRole }) => ({
        url: `client/worker/${userId}/role`,
        method: "PUT",
        body: { newRole },
      }),
      invalidatesTags: ["Workers"], // Invalidate to refetch updated worker data
    }),

    // Mutation to fire a worker
    fireUser: build.mutation({
      query: ({ userId }) => ({
        url: `client/worker/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workers"], // Invalidate to refetch updated worker data
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
  useRegisterUserMutation,
} = api;
