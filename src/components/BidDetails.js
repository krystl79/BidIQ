import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBid } from '../services/db';

const BidDetails = () => {
  const { bidId } = useParams();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBid = async () => {
      try {
        const bidData = await getBid(bidId);
        if (bidData) {
          setBid(bidData);
        }
      } catch (error) {
        console.error('Error fetching bid:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBid();
  }, [bidId]);

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

  const projectDetails = bid.projectDetails || {};

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
              {bid.status}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Needed</h2>
            <ul className="list-disc list-inside space-y-2">
              {projectDetails.equipmentNeeded?.map((equipment, index) => (
                <li key={index} className="text-gray-700">{equipment}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-700">
            This is a preliminary bid based on the information provided. Final pricing and terms will be determined after a site visit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BidDetails; 