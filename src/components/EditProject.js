import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, updateProject, getBidsByProject, saveBid } from '../services/db';

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    timeline: {
      startDate: '',
      endDate: ''
    },
    equipmentMarkup: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidUpdateDialog, setShowBidUpdateDialog] = useState(false);
  const [pendingProjectUpdate, setPendingProjectUpdate] = useState(null);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const project = await getProject(projectId);
        if (!project) {
          setError('Project not found');
          return;
        }
        
        // Load project bids
        const projectBids = await getBidsByProject(projectId);
        setBids(projectBids);
        
        setFormData({
          ...project,
          timeline: {
            startDate: project.timeline.startDate.split('T')[0],
            endDate: project.timeline.endDate.split('T')[0]
          }
        });
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'equipmentMarkup' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!formData.projectName || !formData.projectType || 
          !formData.location.city || !formData.location.state || 
          !formData.timeline.startDate || !formData.timeline.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate dates
      const startDate = new Date(formData.timeline.startDate);
      const endDate = new Date(formData.timeline.endDate);
      if (endDate < startDate) {
        setError('End date cannot be before start date');
        return;
      }

      // Validate markup percentage
      if (formData.equipmentMarkup < 0) {
        setError('Equipment markup cannot be negative');
        return;
      }

      // Format dates for storage
      const projectData = {
        ...formData,
        timeline: {
          startDate: new Date(formData.timeline.startDate).toISOString(),
          endDate: new Date(formData.timeline.endDate).toISOString()
        }
      };

      // If there are existing bids, show the update dialog
      if (bids.length > 0) {
        setPendingProjectUpdate(projectData);
        setShowBidUpdateDialog(true);
      } else {
        // If no bids, just update the project
        await updateProject(projectId, projectData);
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const handleUpdateConfirmation = async (shouldUpdateBids) => {
    try {
      // Update the project
      await updateProject(projectId, pendingProjectUpdate);

      // If user chose to update bids, update each bid with new project details
      if (shouldUpdateBids) {
        await Promise.all(bids.map(async (bid) => {
          const updatedBid = {
            ...bid,
            projectName: pendingProjectUpdate.projectName,
            projectType: pendingProjectUpdate.projectType,
            location: pendingProjectUpdate.location,
            timeline: pendingProjectUpdate.timeline,
            equipmentMarkup: pendingProjectUpdate.equipmentMarkup
          };
          await saveBid(updatedBid);
        }));
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error updating project and bids:', error);
      setError('Failed to update project and bids');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
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

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Project</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {showBidUpdateDialog && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Existing Bids?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This project has {bids.length} existing bid{bids.length !== 1 ? 's' : ''}. Would you like to update {bids.length !== 1 ? 'them' : 'it'} with the new project details?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleUpdateConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    No, Keep Existing Bids
                  </button>
                  <button
                    onClick={() => handleUpdateConfirmation(true)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Yes, Update Bids
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project Type</label>
              <input
                type="text"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  pattern="[0-9]{5}"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="timeline.startDate"
                  value={formData.timeline.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="timeline.endDate"
                  value={formData.timeline.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Equipment Markup (%)</label>
              <input
                type="number"
                name="equipmentMarkup"
                value={formData.equipmentMarkup}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProject; 