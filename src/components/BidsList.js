import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllBids, deleteBid, getProject } from '../services/db';
import AddItemsToBid from './AddItemsToBid';

const BidsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bids, setBids] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [showAddItems, setShowAddItems] = useState(false);
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const allBids = await getAllBids();
      // Get project details for each bid
      const bidsWithProjects = await Promise.all(
        allBids.map(async (bid) => {
          const project = await getProject(bid.projectId);
          return {
            ...bid,
            projectName: project.projectName,
            projectType: project.projectType,
            timeline: project.timeline,
            equipmentMarkup: project.equipmentMarkup
          };
        })
      );
      // Sort bids by createdAt in descending order (most recent first)
      const sortedBids = bidsWithProjects.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBids(sortedBids);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBid = (bid) => {
    navigate(`/view-bid/${bid.id}`);
  };

  const handleEditBid = (bid) => {
    navigate(`/edit-bid/${bid.id}`);
  };

  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      try {
        await deleteBid(bidId);
        // Refresh the bids list
        loadBids();
      } catch (error) {
        console.error('Error deleting bid:', error);
      }
    }
  };

  const handleAddItems = (bid) => {
    setSelectedBidId(bid.id);
    setShowAddItems(true);
  };

  const handleCloseAddItems = () => {
    setShowAddItems(false);
    setSelectedBidId(null);
  };

  const handleSaveItems = async (updatedBid) => {
    await loadBids(); // Refresh the bids list
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = 
      bid.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !projectId || bid.projectId === projectId;
    
    return matchesSearch && matchesProject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {projectId ? 'Project Bids' : 'All Bids'}
          </h1>
          <button
            onClick={() => navigate('/select-project')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Bid
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search bids by project or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredBids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{bid.projectName}</h2>
                <p className="text-gray-600 mb-1">{bid.projectType}</p>
                <p className="text-gray-600 mb-1">
                  {bid.companyName} - {bid.contactName}
                </p>
                <p className="text-gray-600 mb-1">
                  {new Date(bid.timeline.startDate).toLocaleDateString()} - {new Date(bid.timeline.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Created: {new Date(bid.createdAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewBid(bid)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Bid
                  </button>
                  <button
                    onClick={() => handleAddItems(bid)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Ons
                  </button>
                  <button
                    onClick={() => handleDeleteBid(bid.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Bid
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredBids.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bids found.</p>
            </div>
          )}
        </div>
      </div>

      {showAddItems && selectedBidId && (
        <AddItemsToBid
          bidId={selectedBidId}
          onClose={handleCloseAddItems}
          onSave={handleSaveItems}
        />
      )}
    </div>
  );
};

export default BidsList; 