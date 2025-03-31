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
import { getUserProfile, saveUserProfile } from './services/db';
import './styles/print.css';

// Add ProtectedRoute component at the top level, before AppContent
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      // Don't redirect if we're on a public route
      const publicRoutes = ['/', '/login'];
      if (!user && !publicRoutes.includes(location.pathname)) {
        navigate('/login');
      } else if (user) {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate, location]);

  // Allow rendering if we're on a public route or if authenticated
  if (!isAuthenticated && !['/', '/login'].includes(location.pathname)) {
    return null;
  }

  return children;
};

// Create a wrapper component to use hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user and profile data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Load profile from database
          const profile = await getUserProfile();
          if (profile) {
            setProfileData(profile);
          } else if (parsedUser.email) {
            // If no profile exists but we have user email, create initial profile
            const initialProfile = {
              ...profileData,
              email: parsedUser.email
            };
            await saveUserProfile(initialProfile);
            setProfileData(initialProfile);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [profileData]);

  const handleLogin = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update profile with user email if it exists
      const currentProfile = await getUserProfile();
      const updatedProfile = {
        ...(currentProfile || profileData),
        email: userData.email
      };
      await saveUserProfile(updatedProfile);
      setProfileData(updatedProfile);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in handleLogin:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
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
  const showNavbar = user && !['/', '/login'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
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
          path="/view-bid/:bidId"
          element={
            <ProtectedRoute>
              <ViewBid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ViewProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/edit"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

// Main App component
function App() {
  return <AppContent />;
}

export default App;
