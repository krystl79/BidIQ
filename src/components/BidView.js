import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getBid, getProject } from '../services/db';

const BidView = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  // Equipment cost estimates
  const equipmentCosts = {
    'Extension Ladder': {
      daily: 25,
      weekly: 100,
      monthly: 300
    },
    'Step Ladder': {
      daily: 15,
      weekly: 60,
      monthly: 180
    },
    'Safety Harness': {
      daily: 20,
      weekly: 80,
      monthly: 240
    },
    'Safety Rope': {
      daily: 10,
      weekly: 40,
      monthly: 120
    },
    'Work Gloves': {
      daily: 5,
      weekly: 20,
      monthly: 60
    },
    'Safety Glasses': {
      daily: 5,
      weekly: 20,
      monthly: 60
    },
    'LED Christmas Lights': {
      daily: 10,
      weekly: 40,
      monthly: 120
    },
    'Extension Cords': {
      daily: 8,
      weekly: 32,
      monthly: 96
    },
    'Zip Ties': {
      daily: 3,
      weekly: 10,
      monthly: 30
    },
    'Light Clips': {
      daily: 6,
      weekly: 20,
      monthly: 60
    },
    'Timer': {
      daily: 7,
      weekly: 25,
      monthly: 75
    },
    'Storage Bins': {
      daily: 8,
      weekly: 30,
      monthly: 90
    },
    'Basic Tools': {
      daily: 20,
      weekly: 80,
      monthly: 240
    }
  };

  useEffect(() => {
    const fetchBid = async () => {
      try {
        // Check if we have temporary data from navigation state
        if (location.state?.projectData) {
          setBid({
            projectDetails: location.state.projectData,
            status: 'draft',
            createdAt: new Date()
          });
          setLoading(false);
          return;
        }

        // If no temporary data, try to fetch from database
        const bidData = await getBid(projectId);
        if (bidData) {
          setBid(bidData);
        } else {
          const projectData = await getProject(projectId);
          if (projectData) {
            setBid({
              projectDetails: projectData,
              status: 'draft',
              createdAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error fetching bid:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBid();
  }, [projectId, location.state]);

  const calculateEquipmentCost = (equipmentList, startDate, endDate) => {
    if (!equipmentList || !startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return equipmentList.reduce((total, item) => {
      const costs = equipmentCosts[item];
      if (!costs) return total;

      // Determine the best rate based on duration
      let rate;
      if (days >= 30) {
        rate = costs.monthly;
      } else if (days >= 7) {
        rate = costs.weekly;
      } else {
        rate = costs.daily * days;
      }

      return total + rate;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading bid details...</div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Bid not found</div>
      </div>
    );
  }

  const projectDetails = bid.projectDetails || bid;
  const equipmentCost = calculateEquipmentCost(
    projectDetails.equipmentNeeded,
    projectDetails.startDate,
    projectDetails.endDate
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{projectDetails.projectName}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Project Type: {projectDetails.projectType}</span>
            <span className={`px-2 py-1 text-sm rounded-full ${
              bid.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {bid.status || 'draft'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Start Date:</span> {projectDetails.startDate}</p>
              <p><span className="font-medium">End Date:</span> {projectDetails.endDate}</p>
              <p><span className="font-medium">Location:</span> {projectDetails.location?.city}, {projectDetails.location?.state} {projectDetails.location?.zipCode}</p>
              <p><span className="font-medium">Home Type:</span> {projectDetails.homeType}</p>
              <p><span className="font-medium">Ladder Comfort:</span> {projectDetails.climbingLadder ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Recommended</h2>
            <div className="space-y-4">
              {projectDetails.equipmentNeeded?.map((equipment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{equipment}</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Daily:</span>
                      <p className="font-medium">${equipmentCosts[equipment]?.daily || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Weekly:</span>
                      <p className="font-medium">${equipmentCosts[equipment]?.weekly || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly:</span>
                      <p className="font-medium">${equipmentCosts[equipment]?.monthly || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Estimated Equipment Cost</h3>
              <p className="text-2xl font-bold text-blue-600">${equipmentCost}</p>
              <p className="text-sm text-gray-600 mt-1">Based on project duration</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-700">
            This is a preliminary bid based on the information provided.
          </p>
          {location.state?.isTemporary && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account to Save and Manage Your Bids
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidView; 