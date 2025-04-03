import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <img
            src="/logo.png"
            alt="BidIQ Logo"
            className="h-6 mb-1"
            onError={(e) => console.error('Error loading logo:', e)}
          />
          <span className="text-xs">Dashboard</span>
        </Link>

        <Link
          to="/rfp-responses"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/rfp-responses') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs">Proposals</span>
        </Link>

        <Link
          to="/projects"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/projects') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs">Projects</span>
        </Link>

        <Link
          to="/bids"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/bids') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Bids</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/profile') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav; 