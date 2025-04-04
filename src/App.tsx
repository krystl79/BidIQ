import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import ProjectChat from './pages/ProjectChat';
import EquipmentSelection from './pages/EquipmentSelection';
import BidReview from './pages/BidReview';
import Dashboard from './pages/Dashboard';
import RentVsBuyAnalysis from './pages/RentVsBuyAnalysis';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-input"
            element={
              <ProtectedRoute>
                <ProjectChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment-selection"
            element={
              <ProtectedRoute>
                <EquipmentSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bid-review"
            element={
              <ProtectedRoute>
                <BidReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rent-vs-buy"
            element={
              <ProtectedRoute>
                <RentVsBuyAnalysis />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 