// filepath: c:\Users\ryans\OneDrive\Desktop\withsecurity\admin - Copy\client\src\state\store.js
import { configureStore } from '@reduxjs/toolkit'
import { adminApi } from './adminApi'
import { hrApi } from './hrApi'
import { financeApi } from './financeApi'
import { coreApi } from './coreApi'
import { logisticApi } from './logisticApi'
import { setupListeners } from '@reduxjs/toolkit/query'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  userId: '',
  auth: {
    role: null,
  },
}

const changeState = (state = initialState, { type, payload }) => {
  switch (type) {
    case 'set':
      return { ...state, ...payload }
    case 'SET_USER_ROLE':
      return {
        ...state,
        auth: {
          ...state.auth,
          role: payload.role,
        },
      }
    default:
      return state
  }
}

const store = configureStore({
  reducer: {
    changeState,
    [adminApi.reducerPath]: adminApi.reducer,
    [hrApi.reducerPath]: hrApi.reducer,
    [logisticApi.reducerPath]: logisticApi.reducer,
    [coreApi.reducerPath]: coreApi.reducer,
    [financeApi.reducerPath]: financeApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(
    adminApi.middleware, 
    hrApi.middleware,
    logisticApi.middleware,
    coreApi.middleware,
    financeApi.middleware),
})
setupListeners(store.dispatch)

export default store