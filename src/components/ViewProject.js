import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getBidsByProject } from '../services/db';

const ViewProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Load project data
        const project = await getProject(projectId);
        if (!project) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }

        // Load bids for this project
        const projectBids = await getBidsByProject(projectId);
        
        setProjectData(project);
        setBids(projectBids);
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Error loading project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleCreateBid = () => {
    // Store current project in session storage for bid creation
    sessionStorage.setItem('currentProject', JSON.stringify(projectData));
    navigate('/create-bid');
  };

  const handleViewBids = () => {
    navigate(`/bids?projectId=${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Project Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? 'An error occurred while loading the project.' : 'The project you\'re looking for could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{projectData.projectName}</h1>
            <p className="text-gray-600">Created: {new Date(projectData.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Projects
            </button>
            <button
              onClick={handleCreateBid}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Bid
            </button>
          </div>
        </div>

        {/* Project Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Project Type</p>
              <p className="font-medium">{projectData.projectType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {projectData.location.city}, {projectData.location.state} {projectData.location.zipCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">
                {new Date(projectData.timeline.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">
                {new Date(projectData.timeline.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Equipment Markup</p>
              <p className="font-medium">{projectData.equipmentMarkup}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Bids</p>
              <p className="font-medium">
                <button
                  onClick={handleViewBids}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {projectData.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{projectData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProject; 