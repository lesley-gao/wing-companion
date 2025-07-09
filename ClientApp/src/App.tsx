// ClientApp/src/App.tsx - Updated to include Error Boundary and Notification System
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AppThemeProvider } from './themes/ThemeProvider';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NotificationSystem } from './components/ui/NotificationSystem';
import { LoadingOverlay } from './components/ui/Loading';
import { Layout } from './components/Layout';
import { useAppSelector } from './store/hooks';

// Pages
import FlightCompanion from './components/FlightCompanion';
import Pickup from './components/Pickup';
import UserProfile from './components/UserProfile';
import { FetchData } from './components/FetchData';

// App Content Component (needs access to Redux state)
const AppContent: React.FC = () => {
  const isLoading = useAppSelector((state) => state.ui.isLoading);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application Error:', error, errorInfo);
        // You can log to error reporting service here
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<FlightCompanion />} />
            <Route path="/flight-companion" element={<FlightCompanion />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/fetch-data" element={<FetchData />} />
          </Routes>
        </Layout>
      </Router>

      {/* Global Loading Overlay */}
      <LoadingOverlay 
        open={isLoading} 
        message="Please wait..."
      />

      {/* Global Notification System */}
      <NotificationSystem
        maxNotifications={5}
        position={{ vertical: 'bottom', horizontal: 'right' }}
        transition="slide"
        autoHideDuration={6000}
      />
    </ErrorBoundary>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </Provider>
  );
};

export default App;