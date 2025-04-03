import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CreateBid from './components/CreateBid';
import BidsList from './components/BidsList';
import Profile from './components/Profile';
import ViewBid from './components/ViewBid';
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
import TopNav from './components/TopNav';
import ProposalDetails from './components/ProposalDetails';
import ProposalsList from './components/ProposalsList';
import ProtectedRoute from './components/ProtectedRoute';

// Create a wrapper component to use hooks
function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();
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
          path="/upload-solicitation"
          element={
            <ProtectedRoute>
              <SolicitationUploadScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute>
              <ProposalsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfp-responses"
          element={
            <ProtectedRoute>
              <RFPProposalsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfp-responses/:responseId"
          element={
            <ProtectedRoute>
              <ViewRFPProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:proposalId/details"
          element={
            <ProtectedRoute>
              <ProposalDetails />
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
          path="/projects/:projectId"
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
        <Route
          path="/projects/:projectId/bids"
          element={
            <ProtectedRoute>
              <BidsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/bids/new"
          element={
            <ProtectedRoute>
              <CreateBid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bids/:bidId"
          element={
            <ProtectedRoute>
              <ViewBid />
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
          path="/bids"
          element={
            <ProtectedRoute>
              <BidsList />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showNavbar && <TopNav />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
