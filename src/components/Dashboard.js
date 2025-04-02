import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="BidIQ Logo"
            className="h-16 mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to BidIQ
          </h1>
          <p className="mt-2 text-gray-600">
            Your AI-powered bid assistant
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => navigate('/upload-solicitation')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Upload Solicitation or RFP</span>
          </button>

          <button
            onClick={() => navigate('/rfp-responses')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Manage Proposals</span>
          </button>

          <button
            onClick={() => navigate('/create-project')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Create Project</span>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Projects</span>
          </button>

          <button
            onClick={() => navigate('/bids')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Bids</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-lg font-medium text-gray-900">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;