import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost, handleApiResponse } from '../../utils/api';

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  preferredLanguage: string;
  isVerified: boolean;
  emergencyContact?: string;
  emergencyPhone?: string;
  profilePicture?: string;
  rating?: number;
  totalRatings?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  preferredLanguage: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiPost('/api/auth/login', credentials);
      const data = await handleApiResponse(response);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      // Return error key for localization
      return rejectWithValue('loginFailed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Return error key for localization
        return rejectWithValue('noToken');
      }

      const response = await apiGet('/api/user/profile');
      
      if (!response.ok) {
        // If unauthorized, clear the token
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        // Return error key for localization
        return rejectWithValue('getUserProfileFailed');
      }

      const user = await response.json();
      return { user, token };
    } catch (error) {
      // Return error key for localization
      return rejectWithValue('getUserProfileFailed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        // Clear user data on rejection
        state.user = null;
        state.error = action.payload as string || 'Failed to fetch user profile.';
        // If it's a token-related error, clear the token
        if (action.payload === 'noToken' || action.payload === 'getUserProfileFailed') {
          state.token = null;
        }
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
