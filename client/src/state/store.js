import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
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
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
})

setupListeners(store.dispatch)

export default store
