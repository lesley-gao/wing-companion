// ClientApp/src/components/__tests__/Navigation.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Navigation } from '../Navigation';
import uiSlice, { UIState } from '../../store/slices/uiSlice';

// Mock React Router's useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/',
  }),
}));

// Mock matchMedia for useMediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const theme = createTheme();

const createMockStore = (initialState?: Partial<UIState>) => {
  return configureStore({
    reducer: {
      ui: uiSlice,
    },
    preloadedState: {
      ui: {
        theme: 'light' as const,
        isDrawerOpen: false,
        notifications: [],
        isLoading: false,
        currentPage: '/',
        searchQuery: '',
        ...initialState,
      },
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

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders navigation with default title', () => {
      renderWithProviders(<Navigation />);
      
      expect(screen.getByText('NetworkingApp')).toBeInTheDocument();
    });

    it('renders navigation with custom title', () => {
      renderWithProviders(<Navigation title="Custom App" />);
      
      expect(screen.getByText('Custom App')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      renderWithProviders(<Navigation />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Flight Companion')).toBeInTheDocument();
      expect(screen.getByText('Airport Pickup')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderWithProviders(<Navigation />);
      
      const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    it('shows menu button on mobile', () => {
      renderWithProviders(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open drawer/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'open drawer');
    });

    it('opens mobile drawer when menu button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMenuToggle = jest.fn();
      
      renderWithProviders(
        <Navigation onMenuToggle={mockOnMenuToggle} mobileOpen={false} />
      );
      
      const menuButton = screen.getByRole('button', { name: /open drawer/i });
      await user.click(menuButton);
      
      expect(mockOnMenuToggle).toHaveBeenCalledWith(true);
    });

    it('hides navigation items on mobile', () => {
      renderWithProviders(<Navigation />);
      
      // On mobile, navigation items should not be visible in the app bar
      // They should only be in the drawer
      const appBar = screen.getByRole('banner');
      const navItemsInAppBar = within(appBar).queryByText('Flight Companion');
      expect(navItemsInAppBar).not.toBeInTheDocument();
    });
  });

  describe('Desktop Behavior', () => {
    beforeEach(() => {
      // Mock desktop viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query !== '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    it('does not show menu button on desktop', () => {
      renderWithProviders(<Navigation />);
      
      const menuButton = screen.queryByRole('button', { name: /open drawer/i });
      expect(menuButton).not.toBeInTheDocument();
    });

    it('shows navigation items inline on desktop', () => {
      renderWithProviders(<Navigation />);
      
      // Should find navigation links in the toolbar
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /flight companion/i })).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('toggles theme when theme button is clicked', async () => {
      const user = userEvent.setup();
      const store = createMockStore({ theme: 'light' });
      
      renderWithProviders(<Navigation />, store);
      
      const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
      await user.click(themeToggle);
      
      // Check if the Redux action was dispatched
      const state = store.getState();
      expect(state.ui.theme).toBe('dark');
    });

    it('shows correct theme toggle icon for light theme', () => {
      const store = createMockStore({ theme: 'light' });
      renderWithProviders(<Navigation />, store);
      
      const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('shows correct theme toggle icon for dark theme', () => {
      const store = createMockStore({ theme: 'dark' });
      renderWithProviders(<Navigation />, store);
      
      const themeToggle = screen.getByRole('button', { name: /switch to light mode/i });
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('highlights active navigation item', () => {
      // Mock current location as /flight-companion
      jest.mocked(require('react-router-dom').useLocation).mockReturnValue({
        pathname: '/flight-companion',
      });
      
      renderWithProviders(<Navigation />);
      
      const flightCompanionLink = screen.getByRole('link', { name: /flight companion/i });
      expect(flightCompanionLink).toHaveClass('bg-blue-100');
    });

    it('renders custom navigation items', () => {
      const customItems = [
        { text: 'Custom Item', path: '/custom', icon: <div>icon</div> },
      ];
      
      renderWithProviders(<Navigation items={customItems} />);
      
      expect(screen.getByText('Custom Item')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on mobile menu button', () => {
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      renderWithProviders(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open drawer/i });
      expect(menuButton).toHaveAttribute('aria-label', 'open drawer');
    });

    it('has proper ARIA labels on theme toggle', () => {
      renderWithProviders(<Navigation />);
      
      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(themeToggle).toHaveAttribute('title');
    });

    it('navigation is keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Navigation />);
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      homeLink.focus();
      
      expect(homeLink).toHaveFocus();
      
      // Tab to next navigation item
      await user.tab();
      const flightCompanionLink = screen.getByRole('link', { name: /flight companion/i });
      expect(flightCompanionLink).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles missing navigation items gracefully', () => {
      renderWithProviders(<Navigation items={[]} />);
      
      expect(screen.getByText('NetworkingApp')).toBeInTheDocument();
      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles undefined onMenuToggle callback on mobile', async () => {
      const user = userEvent.setup();
      
      // Mock mobile view
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      renderWithProviders(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /open drawer/i });
      
      // Should not throw error when onMenuToggle is undefined
      await expect(user.click(menuButton)).resolves.not.toThrow();
    });

    it('handles drawer interaction without callbacks', () => {
      // Mock mobile view
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      // Render with mobileOpen=true to show the drawer
      expect(() => {
        renderWithProviders(<Navigation mobileOpen={true} />);
      }).not.toThrow();

      // Verify the drawer content is accessible
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Flight Companion')).toBeInTheDocument();
    });
  });

  describe('Drawer Functionality', () => {
    beforeEach(() => {
      // Mock mobile viewport for drawer tests
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 959.95px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
    });

    it('shows drawer content when open', () => {
      renderWithProviders(<Navigation mobileOpen={true} />);
      
      // Navigation items should be visible in the drawer
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Flight Companion')).toBeInTheDocument();
      expect(screen.getByText('Airport Pickup')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('closes drawer when navigation item is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMenuToggle = jest.fn();
      
      renderWithProviders(
        <Navigation onMenuToggle={mockOnMenuToggle} mobileOpen={true} />
      );
      
      const homeLink = screen.getByText('Home');
      await user.click(homeLink);
      
      expect(mockOnMenuToggle).toHaveBeenCalledWith(false);
    });
  });
});