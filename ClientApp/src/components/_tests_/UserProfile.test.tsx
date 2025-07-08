// ClientApp/src/components/__tests__/UserProfile.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import UserProfile from '../UserProfile';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const theme = createTheme();

const mockVerifiedUser = {
  id: 1,
  email: 'john.doe@email.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+64211234567',
  preferredLanguage: 'English',
  isVerified: true,
  emergencyContact: 'Jane Doe',
  emergencyPhone: '+64211234568',
  rating: 4.5,
  totalRatings: 12,
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-12-01T10:00:00Z',
};

const mockStats = {
  totalFlightCompanionRequests: 3,
  totalFlightCompanionOffers: 5,
  totalPickupRequests: 2,
  totalPickupOffers: 4,
  completedServices: 8,
  averageRating: 4.5,
  totalRatings: 12,
};

const createMockStore = (user: any = mockVerifiedUser, isAuthenticated = true) => {
  return configureStore({
    reducer: {
      auth: (state = {
        user,
        isAuthenticated,
        isLoading: false,
        error: null,
      }) => state,
    },
  });
};

const renderWithProviders = (ui: React.ReactElement, store = createMockStore()) => {
  return render(
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          {ui}
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  );
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('Authentication States', () => {
    it('shows loading state when user data is being fetched', () => {
      const loadingStore = createMockStore(null, true);
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<UserProfile />, loadingStore);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows unauthenticated message when user is not logged in', () => {
      const unauthStore = createMockStore(null, false);
      
      renderWithProviders(<UserProfile />, unauthStore);
      
      expect(screen.getByText('Please log in to view your profile.')).toBeInTheDocument();
    });
  });

  describe('Profile Display', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVerifiedUser),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
    });

    it('renders user profile information correctly', async () => {
      renderWithProviders(<UserProfile />);

      // Wait for the first element to appear, then check all elements
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Once loaded, all other elements should be present immediately
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@email.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+64211234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('English')).toBeInTheDocument();
    });

    it('shows verification status correctly', async () => {
      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });

    it('renders activity statistics', async () => {
      renderWithProviders(<UserProfile />);

      // Wait for the first statistic to appear
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // Requests Created (3+2)
      });

      // Once loaded, check all other statistics
      expect(screen.getByText('9')).toBeInTheDocument(); // Services Offered (5+4)
      expect(screen.getByText('8')).toBeInTheDocument(); // Completed Services
      expect(screen.getByText('4.5/5.0')).toBeInTheDocument(); // Average Rating
    });
  });

  describe('Profile Editing', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVerifiedUser),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
    });

    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      // Clear first name
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      // Enter invalid phone number
      const phoneInput = screen.getByDisplayValue('+64211234567');
      await user.clear(phoneInput);
      await user.type(phoneInput, 'invalid-phone');
      await user.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Phone number must be in format +64XXXXXXXX')).toBeInTheDocument();
      });
    });

    it('saves profile changes successfully', async () => {
      const user = userEvent.setup();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVerifiedUser),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockVerifiedUser, firstName: 'Jane' }),
        });

      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));

      // Update first name
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      await user.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({
            firstName: 'Jane',
            lastName: 'Doe',
            phoneNumber: '+64211234567',
            preferredLanguage: 'English',
            emergencyContact: 'Jane Doe',
            emergencyPhone: '+64211234568',
          }),
        });
      });
    });
  });

  describe('Verification Submission', () => {
    const unverifiedUser = { ...mockVerifiedUser, isVerified: false };

    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(unverifiedUser),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
    });

    it('shows verification button for unverified users', async () => {
      const unverifiedStore = createMockStore(unverifiedUser);
      renderWithProviders(<UserProfile />, unverifiedStore);

      await waitFor(() => {
        expect(screen.getByText('Submit Verification')).toBeInTheDocument();
      });
    });

    it('opens verification dialog when button is clicked', async () => {
      const user = userEvent.setup();
      const unverifiedStore = createMockStore(unverifiedUser);
      renderWithProviders(<UserProfile />, unverifiedStore);

      await waitFor(() => {
        expect(screen.getByText('Submit Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Submit Verification'));

      expect(screen.getByText('Submit Verification Documents')).toBeInTheDocument();
    });

    it('validates verification document references', async () => {
      const user = userEvent.setup();
      const unverifiedStore = createMockStore(unverifiedUser);
      renderWithProviders(<UserProfile />, unverifiedStore);

      await waitFor(() => {
        expect(screen.getByText('Submit Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Submit Verification'));

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Document references must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('submits verification documents successfully', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Verification submitted' }),
      });

      const unverifiedStore = createMockStore(unverifiedUser);
      renderWithProviders(<UserProfile />, unverifiedStore);

      await waitFor(() => {
        expect(screen.getByText('Submit Verification')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Submit Verification'));

      // Fill in document references
      const textarea = screen.getByLabelText('Document References');
      await user.type(textarea, 'Passport: 1234567890, Driver License: DL123456');

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user/submit-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify({
            documentReferences: 'Passport: 1234567890, Driver License: DL123456',
          }),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('handles profile fetch error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Error loading profile')).toBeInTheDocument();
      });
    });

    it('handles profile update error gracefully', async () => {
      const user = userEvent.setup();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVerifiedUser),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        })
        .mockRejectedValueOnce(new Error('Update failed'));

      renderWithProviders(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Error updating profile')).toBeInTheDocument();
      });
    });
  });
});