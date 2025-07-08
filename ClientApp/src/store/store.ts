import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import flightCompanionSlice from './slices/flightCompanionSlice';
import pickupSlice from './slices/pickupSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    flightCompanion: flightCompanionSlice,
    pickup: pickupSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;