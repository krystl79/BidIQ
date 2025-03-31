import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileManagement from './ProfileManagement';
import SolicitationUpload from './SolicitationUpload';

const Dashboard = ({ profileData, userEmail, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSolicitationModal, setShowSolicitationModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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
              <h3 className="text-lg font-medium text-gray-900">Upload Solicitation/RFP</h3>
              <p className="mt-2 text-gray-600">Upload or link a solicitation to create a project</p>
              <button
                onClick={() => setShowSolicitationModal(true)}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Upload Solicitation
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
                onClick={() => navigate('/profile')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>

        {showProfileModal && (
          <ProfileManagement
            profileData={profileData}
            onClose={(updatedData) => {
              if (updatedData) {
                onProfileUpdate(updatedData);
              }
              setShowProfileModal(false);
            }}
          />
        )}

        {showSolicitationModal && (
          <SolicitationUpload
            onClose={() => setShowSolicitationModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;