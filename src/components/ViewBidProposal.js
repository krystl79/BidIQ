import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBid } from '../services/db';
import { Download as DownloadIcon } from '@mui/icons-material';
import html2pdf from 'html2pdf.js';

const ViewBidProposal = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBid = async () => {
      const bidData = await getBid(bidId);
      setBid(bidData);
      setLoading(false);
    };
    fetchBid();
  }, [bidId]);

  const handleDownloadBid = () => {
    const element = document.getElementById('bid-content');
    const opt = {
      margin: 1,
      filename: `${bid.projectDetails.projectName}-bid.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div className="p-8 text-center">Loading bid proposal...</div>;
  if (!bid) return <div className="p-8 text-center text-red-600">Bid not found.</div>;

  const { projectDetails, selectedEquipment, totalCost } = bid;
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl" id="bid-content">
        <h2 className="text-2xl font-bold mb-4">Bid Proposal</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Project Details</h3>
          <p><strong>Name:</strong> {projectDetails.projectName}</p>
          <p><strong>Type:</strong> {projectDetails.projectType}</p>
          <p><strong>Location:</strong> {projectDetails.location}</p>
          <p><strong>Duration:</strong> {projectDetails.duration} days</p>
          <p><strong>Home Type:</strong> {projectDetails.homeType}</p>
          <p><strong>Ladder Comfort:</strong> {projectDetails.climbingLadder}</p>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Equipment & Costs</h3>
          {selectedEquipment.map(eq => (
            <p key={eq.id}>
              {eq.name}: ${eq.selectedRate.rate} {eq.selectedRate.type}
            </p>
          ))}
          <p className="font-bold mt-2">Total Cost: ${totalCost}</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 mt-6 w-full max-w-2xl">
        <button
          onClick={handleDownloadBid}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
        >
          <DownloadIcon className="mr-2" />
          Download Bid Proposal
        </button>
        <button
          onClick={() => navigate('/login?mode=signup')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default ViewBidProposal; 