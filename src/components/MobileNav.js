import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navigation if user is not logged in
  if (!user) return null;

  // Check if we're on a page that needs a back button
  const showBackButton = location.pathname === '/projects' || location.pathname === '/bids';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        {showBackButton ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs mt-1">Back</span>
          </button>
        ) : (
          <>
            <Link
              to="/dashboard"
              className={`flex flex-col items-center ${
                location.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>

            <Link
              to="/bids"
              className={`flex flex-col items-center ${
                location.pathname === '/bids' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs mt-1">Bids</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex flex-col items-center ${
                location.pathname === '/analytics' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs mt-1">Analytics</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center ${
                location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNav; 