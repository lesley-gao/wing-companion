import { createSlice } from '@reduxjs/toolkit';

export interface PickupState {
  requests: any[];
  offers: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PickupState = {
  requests: [],
  offers: [],
  isLoading: false,
  error: null,
};

const pickupSlice = createSlice({
  name: 'pickup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = pickupSlice.actions;
export default pickupSlice.reducer;