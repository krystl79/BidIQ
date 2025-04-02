import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileManagement from './ProfileManagement';
import SolicitationUpload from './SolicitationUpload';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = ({ profileData, userEmail, onProfileUpdate }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSolicitationModal, setShowSolicitationModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSolicitationClick = () => {
    if (!currentUser) {
      alert('Please log in to upload a solicitation');
      navigate('/login');
      return;
    }
    setShowSolicitationModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.email || 'Guest'}</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Upload Solicitation/RFP</h3>
              <p className="mt-2 text-gray-600">Upload or link a solicitation to create a project</p>
              <button
                onClick={() => navigate('/upload-solicitation')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Solicitation
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Create Project</h3>
              <p className="mt-2 text-gray-600">Start a new construction project</p>
              <button
                onClick={() => navigate('/create-project')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Project
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">View Projects</h3>
              <p className="mt-2 text-gray-600">View and manage your construction projects</p>
              <button
                onClick={() => navigate('/projects')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Projects
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">View Bids</h3>
              <p className="mt-2 text-gray-600">View and manage your project bids</p>
              <button
                onClick={() => navigate('/bids')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Bids
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Manage Profile</h3>
              <p className="mt-2 text-gray-600">Update your account settings and preferences</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <ProfileManagement
          onClose={() => setShowProfileModal(false)}
          profileData={profileData}
          userEmail={userEmail}
          onProfileUpdate={onProfileUpdate}
        />
      )}

      {showSolicitationModal && (
        <SolicitationUpload
          onClose={() => setShowSolicitationModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;