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
import SolicitationUploadScreen from './components/SolicitationUploadScreen';
import RFPProposalsList from './components/RFPResponsesList';
import ViewRFPProposal from './components/ViewRFPResponse';
import { getUserProfile, saveUserProfile } from './services/db';
import { useAuth } from './contexts/AuthContext';
import './styles/print.css';
import MobileNav from './components/MobileNav';
import TopNav from './components/TopNav';
import ProjectDetails from './components/ProjectDetails';
import BidDetails from './components/BidDetails';
import BidView from './components/BidView';
import ProposalDetails from './components/ProposalDetails';

// Add ProtectedRoute component at the top level, before AppContent
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Auth State:', { currentUser, loading });
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

  useEffect(() => {
    console.log('AppContent - Initial Mount:', { currentUser, location });
  }, [currentUser, location]);

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
      {showNavbar && (
        <>
          <div className="hidden md:block">
            <TopNav onLogout={handleLogout} />
          </div>
          <div className="md:hidden">
            <Navbar user={currentUser} onLogout={handleLogout} />
          </div>
        </>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <Dashboard />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfp-responses"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <RFPProposalsList />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfp-responses/:responseId"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <ViewRFPProposal />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:proposalId/details"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <ProposalDetails />
                <MobileNav />
              </div>
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
              <div className="pb-16 md:pb-0">
                <ProjectList />
                <MobileNav />
              </div>
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
              <div className="pb-16 md:pb-0">
                <BidsList />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <Profile />
                <MobileNav />
              </div>
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
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <ViewProject />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/edit"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <EditProject />
                <MobileNav />
              </div>
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
          path="/analytics"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <Dashboard />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-solicitation"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <SolicitationUploadScreen />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <ProjectDetails />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bids/:bidId"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <BidDetails />
                <MobileNav />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/bid"
          element={
            <div className="pb-16 md:pb-0">
              <BidView />
              <MobileNav />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// Wrap the AppContent with ErrorBoundary
function App() {
  useEffect(() => {
    console.log('App - Environment:', process.env.NODE_ENV);
    console.log('App - Firebase Config:', {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Present' : 'Missing',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? 'Present' : 'Missing',
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? 'Present' : 'Missing',
      appId: process.env.REACT_APP_FIREBASE_APP_ID ? 'Present' : 'Missing',
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ? 'Present' : 'Missing'
    });
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
