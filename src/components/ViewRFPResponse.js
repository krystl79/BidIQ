import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRFPResponse, updateRFPResponse } from '../services/db';

const ViewRFPProposal = () => {
  const navigate = useNavigate();
  const { responseId } = useParams();
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState(null);

  const loadResponse = useCallback(async () => {
    try {
      const responseData = await getRFPResponse(responseId);
      if (!responseData) {
        setError('Proposal not found');
        return;
      }
      setResponse(responseData);
      setEditedResponse(responseData);
    } catch (error) {
      console.error('Error loading RFP proposal:', error);
      setError('Error loading proposal data');
    } finally {
      setIsLoading(false);
    }
  }, [responseId]);

  useEffect(() => {
    loadResponse();
  }, [loadResponse]);

  const handleBack = () => {
    navigate('/rfp-responses');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedResponse(response);
  };

  const handleSave = async () => {
    try {
      await updateRFPResponse(responseId, editedResponse);
      setResponse(editedResponse);
      setIsEditing(false);
      loadResponse(); // Reload to get the updated data
    } catch (error) {
      console.error('Error updating proposal:', error);
      setError('Error updating proposal. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedResponse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
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

  if (error || !response) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Proposal Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? 'An error occurred while loading the proposal.' : 'The proposal you\'re looking for could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Proposals
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
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedResponse.title}
                onChange={handleChange}
                className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{response.title}</h1>
            )}
            <p className="text-gray-600">Created: {new Date(response.createdAt?.seconds * 1000).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Proposals
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Response Details */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Proposal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="company"
                    value={editedResponse.company}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{response.company}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editedResponse.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">{response.status}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dueDate"
                    value={editedResponse.dueDate?.split('T')[0] || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">
                    {response.dueDate ? new Date(response.dueDate).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            {isEditing ? (
              <textarea
                name="notes"
                value={editedResponse.notes || ''}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add notes about this proposal..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">
                {response.notes || 'No notes added.'}
              </p>
            )}
          </div>

          {/* Additional sections can be added here for attachments, comments, etc. */}
        </div>
      </div>
    </div>
  );
};

export default ViewRFPProposal; 