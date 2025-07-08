import { createSlice } from '@reduxjs/toolkit';

export interface FlightCompanionState {
  requests: any[];
  offers: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FlightCompanionState = {
  requests: [],
  offers: [],
  isLoading: false,
  error: null,
};

const flightCompanionSlice = createSlice({
  name: 'flightCompanion',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = flightCompanionSlice.actions;
export default flightCompanionSlice.reducer;