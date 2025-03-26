import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBid, getProject, getUserProfile } from '../services/db';

const ViewBid = () => {
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [bidData, setBidData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showMarkup, setShowMarkup] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!bidId) {
        setError('No bid ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Load bid data
        const bid = await getBid(bidId.toString());
        if (!bid) {
          setError('Bid not found');
          setIsLoading(false);
          return;
        }

        // Load project data to ensure we have the latest
        const project = await getProject(bid.projectId);
        if (project) {
          bid.projectName = project.projectName;
          bid.projectType = project.projectType;
          bid.location = project.location;
          bid.timeline = project.timeline;
          bid.equipmentMarkup = project.equipmentMarkup;
        }

        setBidData(bid);

        // Load user profile from database
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading bid:', error);
        setError('Error loading bid data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [bidId]);

  const handleBack = () => {
    navigate('/bids');
  };

  const handlePrint = () => {
    window.print();
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

  if (error || !bidData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Bid Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? 'An error occurred while loading the bid.' : 'The bid you\'re looking for could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Bids
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bid Proposal</h1>
            <p className="text-gray-600">Created: {new Date(bidData.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-4 print:hidden">
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Bids
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Print / Download PDF
            </button>
          </div>
        </div>

        {/* Equipment Markup Toggle */}
        <div className="mb-6 flex items-center space-x-4 print:hidden">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showMarkup}
              onChange={(e) => setShowMarkup(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">
              Apply Equipment Markup ({bidData.equipmentMarkup}%)
            </span>
          </label>
        </div>

        {/* Proposed By Section */}
        {userProfile && (
          <div className="mb-8 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Proposed By</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">{userProfile.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{userProfile.contactName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{userProfile.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="mb-8 print:mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Project Name</p>
              <p className="font-medium">{bidData.projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project Type</p>
              <p className="font-medium">{bidData.projectType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {bidData.location?.city}, {bidData.location?.state} {bidData.location?.zipCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="font-medium">
                {new Date(bidData.timeline?.startDate).toLocaleDateString()} - {new Date(bidData.timeline?.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8 print:mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{bidData.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{bidData.contactName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{bidData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{bidData.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {bidData.address}<br />
                {bidData.city}, {bidData.state} {bidData.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {bidData.notes && (
          <div className="mb-8 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{bidData.notes}</p>
          </div>
        )}

        {/* Equipment Table */}
        <div className="mb-8 print:mb-4 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Details</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bidData.selectedEquipment?.map((item, index) => {
                const rate = item.rates?.[item.selectedRate] || 0;
                const markup = showMarkup ? (rate * (bidData.equipmentMarkup / 100)) : 0;
                const rateWithMarkup = rate + markup;
                const displayRate = showMarkup ? rateWithMarkup : rate;
                const total = displayRate * (item.quantity || 1);
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.selectedRate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${displayRate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50">
                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                  Equipment Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${(bidData.selectedEquipment?.reduce((total, item) => {
                    const rate = item.rates?.[item.selectedRate] || 0;
                    const markup = showMarkup ? (rate * (bidData.equipmentMarkup / 100)) : 0;
                    const rateWithMarkup = rate + markup;
                    return total + (rateWithMarkup * (item.quantity || 1));
                  }, 0) || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add Ons Table */}
        {bidData.additionalItems && bidData.additionalItems.length > 0 && (
          <div className="mb-8 print:mb-4 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Ons</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bidData.additionalItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.quantity * item.cost).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    Add Ons Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${bidData.additionalItems.reduce((total, item) => total + (item.quantity * item.cost), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Total Cost */}
        <div className="mb-8 print:mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Estimated Cost:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${((bidData.selectedEquipment?.reduce((total, item) => {
                  const rate = item.rates?.[item.selectedRate] || 0;
                  const markup = showMarkup ? (rate * (bidData.equipmentMarkup / 100)) : 0;
                  const rateWithMarkup = rate + markup;
                  return total + (rateWithMarkup * (item.quantity || 1));
                }, 0) || 0) + (bidData.additionalItems?.reduce((total, item) => total + (item.quantity * item.cost), 0) || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            This is a computer-generated document. No signature is required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewBid; 