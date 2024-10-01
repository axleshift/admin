// src/state/store.js
import { configureStore } from '@reduxjs/toolkit'; // Import configureStore
import { api } from './api'; // Import the API slice you defined earlier
import { setupListeners } from '@reduxjs/toolkit/query';

const initialState = {
    sidebarShow: true,
    theme: 'light',
    userId: ""
};

// Your existing reducer for handling sidebar and theme state
const changeState = (state = initialState, { type, ...rest }) => {
    switch (type) {
        case 'set':
            return { ...state, ...rest };
        default:
            return state;
    }
};

// Create the store using configureStore
const store = configureStore({
    reducer: {
        changeState, // Add your existing reducer
        [api.reducerPath]: api.reducer, // Add the API slice reducer
    },
    middleware: (getDefault) =>
        getDefault().concat(api.middleware), // Add the API middleware
}); 
setupListeners(store.dispatch)

export default store;
