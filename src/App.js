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
import ProposalsList from './components/ProposalsList';
import ProtectedRoute from './components/ProtectedRoute';

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
          path="/proposals"
          element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <ProposalsList />
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
          path="/projects/:projectId"
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
              <EditProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/bids"
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
              <div className="pb-16 md:pb-0">
                <ViewBid />
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
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
