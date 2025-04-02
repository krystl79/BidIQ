import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRFPResponses } from '../services/db';

const RFPProposalsList = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const allResponses = await getAllRFPResponses();
      setResponses(allResponses);
    } catch (error) {
      console.error('Error loading RFP proposals:', error);
      setError('Error loading proposals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResponse = (response) => {
    navigate(`/rfp-responses/${response.id}`);
  };

  const handleDeleteResponse = async (responseId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await deleteRFPResponse(responseId);
        // Refresh the responses list
        loadResponses();
      } catch (error) {
        console.error('Error deleting proposal:', error);
        setError('Error deleting proposal. Please try again later.');
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const filteredResponses = responses.filter(response =>
    response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Proposals</h1>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search proposals by title or company..."
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

        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500">No proposals found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResponses.map((response) => (
              <div key={response.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{response.title}</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Company: {response.company}</p>
                    <p>Status: {response.status}</p>
                    <p>Created: {new Date(response.createdAt).toLocaleDateString()}</p>
                    {response.dueDate && (
                      <p>Due Date: {new Date(response.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleViewResponse(response)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteResponse(response.id)}
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

export default RFPProposalsList; 