import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

export default ProtectedRoute; 