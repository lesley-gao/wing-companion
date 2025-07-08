// ClientApp/src/App.tsx (updated imports and routes)
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AppThemeProvider } from './themes/ThemeProvider';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import FlightCompanion from './components/FlightCompanion';
import Pickup from './components/Pickup';
import UserProfile from './components/UserProfile'; // Add this import

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/counter" element={<Counter />} />
            <Route path="/fetch-data" element={<FetchData />} />
            <Route path="/flight-companion" element={<FlightCompanion />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/profile" element={<UserProfile />} /> {/* Add this route */}
          </Routes>
        </Layout>
      </AppThemeProvider>
    </Provider>
  );
};

export default App;