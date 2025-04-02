import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects, deleteProject, getBidsByProject } from '../services/db';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectBidCounts, setProjectBidCounts] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const allProjects = await getAllProjects();
      // Get bid counts for each project
      const projectsWithBidCounts = await Promise.all(
        allProjects.map(async (project) => {
          const bids = await getBidsByProject(project.id);
          return {
            ...project,
            bidCount: bids.length
          };
        })
      );
      setProjects(projectsWithBidCounts);
      setProjectBidCounts(projectsWithBidCounts.reduce((acc, project) => ({
        ...acc,
        [project.id]: project.bidCount
      }), {}));
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Error loading projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleViewProject = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleCreateBid = (project) => {
    // Store current project in session storage for bid creation
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    navigate('/create-bid');
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated bids.')) {
      try {
        await deleteProject(projectId);
        // Refresh the projects list
        loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Error deleting project. Please try again later.');
      }
    }
  };

  const handleEditProject = (projectId) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleViewBids = (projectId) => {
    navigate(`/bids?projectId=${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-gray-900">Projects</h1>
          </div>
          <button
            onClick={handleCreateProject}
            className="px-6 py-3 bg-[#4263EB] text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Project
          </button>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search projects by project or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500">No projects found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{project.projectName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{project.projectType}</p>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Location: {project.location.city}, {project.location.state}</p>
                    <p>Timeline: {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}</p>
                    <p>Equipment Markup: {project.equipmentMarkup}%</p>
                    <p>
                      <button
                        onClick={() => handleViewBids(project.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {projectBidCounts[project.id] || 0} {projectBidCounts[project.id] === 1 ? 'Bid' : 'Bids'}
                      </button>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditProject(project.id)}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCreateBid(project)}
                      className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Bid
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList; 