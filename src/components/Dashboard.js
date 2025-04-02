import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="BidIQ Logo" 
              className="h-16 w-auto mb-4"
              onError={(e) => {
                console.error('Logo failed to load');
                e.target.style.display = 'none';
              }}
            />
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Welcome back, {currentUser?.email}
            </h2>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <h3 className="text-lg font-medium text-gray-900">Upload Solicitation</h3>
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
              <h3 className="text-lg font-medium text-gray-900">View Bids</h3>
              <p className="mt-2 text-gray-600">View and manage your bids</p>
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
              <h3 className="text-lg font-medium text-gray-900">Create Bid</h3>
              <p className="mt-2 text-gray-600">Create a new bid for a project</p>
              <button
                onClick={() => navigate('/create-bid')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Bid
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
              <p className="mt-2 text-gray-600">Update your profile and preferences</p>
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Profile Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;