import React, { useState, useEffect } from 'react';
import EquipmentList from './EquipmentList';
import { Autocomplete, TextField } from '@mui/material';

const BidTemplate = ({ selectedEquipment, projectDetails, initialBid, onSave, onClose, profileData }) => {
  const [formData, setFormData] = useState({
    selectedEquipment: selectedEquipment || [],
    companyInfo: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    },
    proposedBy: profileData || null
  });

  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialBid) {
      setFormData(prevData => ({
        ...prevData,
        ...initialBid,
        proposedBy: profileData || initialBid.proposedBy || null
      }));
    }
  }, [initialBid, profileData]);

  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      proposedBy: profileData || prevData.proposedBy
    }));
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      companyInfo: {
        ...prevData.companyInfo,
        [name]: value
      }
    }));
  };

  const handleEquipmentSelect = (equipment) => {
    setFormData(prevData => ({
      ...prevData,
      selectedEquipment: equipment
    }));
    setShowEquipmentSelector(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.companyInfo.companyName || !formData.companyInfo.contactName || !formData.companyInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate equipment selection
    if (!formData.selectedEquipment || formData.selectedEquipment.length === 0) {
      alert('Please select at least one piece of equipment');
      return;
    }

    try {
      // Create bid data
      const bidData = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      // Save bid
      if (onSave) {
        await onSave(bidData);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const calculateTotalCost = () => {
    return formData.selectedEquipment?.reduce((total, item) => total + (item.selectedRate?.rate || 0), 0) || 0;
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleGeneratePDF = () => {
    // TODO: Implement PDF generation
    console.log('Generating PDF with:', { companyInfo: { companyName: formData.companyInfo.companyName, contactName: formData.companyInfo.contactName, email: formData.companyInfo.email, phone: formData.companyInfo.phone, address: formData.companyInfo.address, city: formData.companyInfo.city, state: formData.companyInfo.state, zipCode: formData.companyInfo.zipCode }, selectedEquipment: formData.selectedEquipment, projectDetails });
  };

  const handleSharePDF = () => {
    // TODO: Implement PDF sharing
    console.log('Sharing PDF...');
  };

  const PDFPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">PDF Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-8 bg-white p-8 border border-gray-200 rounded-lg">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Rental Bid</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Company Information Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Bid Recipient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Company Name:</p>
                <p className="text-gray-900">{formData.companyInfo.companyName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Contact Name:</p>
                <p className="text-gray-900">{formData.companyInfo.contactName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email:</p>
                <p className="text-gray-900">{formData.companyInfo.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Phone:</p>
                <p className="text-gray-900">{formData.companyInfo.phone}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-700">Address:</p>
              <p className="text-gray-900">
                {formData.companyInfo.address}<br />
                {formData.companyInfo.city}, {formData.companyInfo.state} {formData.companyInfo.zipCode}
              </p>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Project Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Project Name:</p>
                <p className="text-gray-900">{projectDetails.projectName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Project Type:</p>
                <p className="text-gray-900">{projectDetails.projectType}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Location:</p>
                <p className="text-gray-900">
                  {projectDetails.location.city}, {projectDetails.location.state} {projectDetails.location.zipCode}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Duration:</p>
                <p className="text-gray-900">
                  {projectDetails.timeline.startDate} to {projectDetails.timeline.endDate}
                </p>
              </div>
            </div>
          </div>

          {/* Equipment List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Equipment List</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-4">Equipment</th>
                  <th className="text-left py-2 px-4">Description</th>
                  <th className="text-right py-2 px-4">Rate</th>
                </tr>
              </thead>
              <tbody>
                {formData.selectedEquipment.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">{item.description}</td>
                    <td className="py-2 px-4 text-right">
                      ${item.selectedRate?.rate}/{item.selectedRate?.type}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 px-4" colSpan={2}>Total Cost</td>
                  <td className="py-2 px-4 text-right">
                    ${calculateTotalCost()}/{formData.selectedEquipment[0]?.selectedRate?.type}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          {formData.companyInfo.notes && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.companyInfo.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Create Bid</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Project Name:</span> {projectDetails.projectName}</p>
              <p><span className="font-medium">Project Type:</span> {projectDetails.projectType}</p>
              <p><span className="font-medium">Location:</span> {projectDetails.location.city}, {projectDetails.location.state} {projectDetails.location.zipCode}</p>
              <p><span className="font-medium">Timeline:</span> {new Date(projectDetails.timeline.startDate).toLocaleDateString()} to {new Date(projectDetails.timeline.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Equipment Selection Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Equipment Selection</h3>
              <button
                type="button"
                onClick={() => setShowEquipmentSelector(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formData.selectedEquipment?.length > 0 ? 'Modify Equipment' : 'Select Equipment'}
              </button>
            </div>
            {formData.selectedEquipment?.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.selectedEquipment.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        Rate: ${item.selectedRate?.rate}/{item.selectedRate?.type}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <p className="text-lg font-medium text-gray-900">
                    Total Cost: ${calculateTotalCost()}/{formData.selectedEquipment[0]?.selectedRate?.type}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No equipment selected yet</p>
              </div>
            )}
          </div>

          {/* Company Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bid Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyInfo.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactName"
                  type="text"
                  name="contactName"
                  value={formData.companyInfo.contactName}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.companyInfo.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.companyInfo.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.companyInfo.address}
                onChange={handleInputChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.companyInfo.city}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <Autocomplete
                  value={formData.companyInfo.state}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      companyInfo: {
                        ...prev.companyInfo,
                        state: newValue
                      }
                    }));
                  }}
                  options={states}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type to search state"
                      className="mt-1 w-full"
                    />
                  )}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.companyInfo.zipCode}
                  onChange={handleInputChange}
                  pattern="[0-9]{5}"
                  maxLength="5"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.companyInfo.notes}
                onChange={handleInputChange}
                rows="4"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes or comments..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Bid
            </button>
          </div>
        </form>

        {/* Equipment Selector Modal */}
        {showEquipmentSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Select Equipment</h3>
                <button
                  type="button"
                  onClick={() => setShowEquipmentSelector(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <EquipmentList
                projectDetails={projectDetails}
                onEquipmentSelect={handleEquipmentSelect}
                initialSelectedEquipment={formData.selectedEquipment}
              />
            </div>
          </div>
        )}

        {showPreview && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <PDFPreview />
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleSharePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap text-sm sm:text-base"
          >
            Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidTemplate;
