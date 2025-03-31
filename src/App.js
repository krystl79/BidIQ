import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CreateBid from './components/CreateBid';
import BidsList from './components/BidsList';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import ViewBid from './components/ViewBid';
import SelectProject from './components/SelectProject';
import ViewProject from './components/ViewProject';
import EditProject from './components/EditProject';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { getUserProfile, saveUserProfile } from './services/db';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import './styles/print.css';

// Add ProtectedRoute component at the top level, before AppContent
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Don't redirect if we're on a public route
      const publicRoutes = ['/', '/login'];
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  }, [currentUser, loading, navigate, location]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Always allow rendering for public routes
  if (['/', '/login'].includes(location.pathname)) {
    return children;
  }

  // For protected routes, check authentication
  if (!currentUser) {
    return null;
  }

  return children;
};

// Create a wrapper component to use hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (currentUser) {
          // Load profile from database
          const profile = await getUserProfile();
          if (!profile && currentUser.email) {
            // If no profile exists but we have user email, create initial profile
            const initialProfile = {
              companyName: '',
              contactName: '',
              email: currentUser.email,
              phone: '',
              address: '',
              city: '',
              state: '',
              zipCode: ''
            };
            await saveUserProfile(initialProfile);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Only show navbar for authenticated routes
  const showNavbar = currentUser && !['/', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar user={currentUser} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-bid"
          element={
            <ProtectedRoute>
              <CreateBid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-bid/:bidId"
          element={
            <ProtectedRoute>
              <CreateBid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bids"
          element={
            <ProtectedRoute>
              <BidsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/select-project"
          element={
            <ProtectedRoute>
              <SelectProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-project/:projectId"
          element={
            <ProtectedRoute>
              <ViewProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-project/:projectId"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-bid/:bidId"
          element={
            <ProtectedRoute>
              <ViewBid />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

// Wrap the AppContent with ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
