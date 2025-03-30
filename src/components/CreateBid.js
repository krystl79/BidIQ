import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveBid } from '../services/db';
import EquipmentList from './EquipmentList';

const CreateBid = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    selectedEquipment: [],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // US States array
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we're copying a bid
        const isCopyingBid = sessionStorage.getItem('isCopyingBid') === 'true';
        const copiedBid = sessionStorage.getItem('copiedBid');
        
        // Load project data first
        const projectData = sessionStorage.getItem('currentProject');
        if (!projectData) {
          setError('No project selected. Please select a project first.');
          setIsLoading(false);
          return;
        }

        const parsedProject = JSON.parse(projectData);
        setProjectData(parsedProject);

        if (isCopyingBid && copiedBid) {
          // Handle copied bid data
          const parsedBid = JSON.parse(copiedBid);
          setFormData({
            companyName: parsedBid.companyName || '',
            contactName: parsedBid.contactName || '',
            email: parsedBid.email || '',
            phone: parsedBid.phone || '',
            address: parsedBid.address || '',
            city: parsedBid.city || '',
            state: parsedBid.state || '',
            zipCode: parsedBid.zipCode || '',
            selectedEquipment: parsedBid.selectedEquipment?.map(equipment => ({
              ...equipment,
              quantity: equipment.quantity || 1,
              rateType: equipment.rateType || 'daily',
              price: equipment.price || 0,
              selectedRate: equipment.selectedRate || 'daily'
            })) || [],
            notes: parsedBid.notes || ''
          });
          // Clear the copied bid data from session storage
          sessionStorage.removeItem('copiedBid');
          sessionStorage.removeItem('isCopyingBid');
        } else {
          // For new bids, initialize with empty values
          setFormData({
            companyName: '',
            contactName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            selectedEquipment: [],
            notes: ''
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Remove all non-numeric characters
      const cleanedValue = value.replace(/\D/g, '');
      
      // Format the phone number as (XXX) XXX-XXXX
      let formattedValue = '';
      if (cleanedValue.length > 0) {
        formattedValue = '(' + cleanedValue.substring(0, 3);
        if (cleanedValue.length > 3) {
          formattedValue += ') ' + cleanedValue.substring(3, 6);
          if (cleanedValue.length > 6) {
            formattedValue += '-' + cleanedValue.substring(6, 10);
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEquipmentChange = useCallback((newEquipment) => {
    setFormData(prev => ({
      ...prev,
      selectedEquipment: newEquipment
    }));
  }, []);

  const calculateTotalCost = (equipment) => {
    return equipment.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const rate = item.rates?.[item.selectedRate] || 0;
      return total + (quantity * rate);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate equipment selection
    if (!formData.selectedEquipment || formData.selectedEquipment.length === 0) {
      setError('Please select at least one piece of equipment');
      return;
    }

    try {
      // Ensure we have project data
      if (!projectData || !projectData.id) {
        setError('No project selected. Please select a project first.');
        return;
      }

      // Calculate total cost
      const totalCost = calculateTotalCost(formData.selectedEquipment);

      // Create bid data with all required fields
      const bidData = {
        ...formData,
        id: Date.now().toString(), // Convert ID to string
        projectId: projectData.id,
        projectName: projectData.projectName,
        projectType: projectData.projectType,
        location: projectData.location,
        timeline: projectData.timeline,
        createdAt: new Date().toISOString(),
        totalCost: totalCost
      };

      // Save the bid
      await saveBid(bidData);

      // Clear session storage
      sessionStorage.removeItem('currentProject');
      sessionStorage.removeItem('copiedBid');
      sessionStorage.removeItem('isCopyingBid');

      // Navigate to bids list
      navigate('/bids');
    } catch (error) {
      console.error('Error saving bid:', error);
      setError('Failed to save bid. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      // Clear session storage
      sessionStorage.removeItem('currentProject');
      sessionStorage.removeItem('copiedBid');
      navigate('/bids');
    }
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

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'No Project Selected'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? 'An error occurred while loading the data.' : 'Please select a project to create a bid.'}
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Bid</h2>
          
          {/* Project Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Project Name</p>
                <p className="mt-1 text-sm text-gray-900">{projectData.projectName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Project Type</p>
                <p className="mt-1 text-sm text-gray-900">{projectData.projectType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="mt-1 text-sm text-gray-900">
                  {projectData.location.address}<br />
                  {projectData.location.city}, {projectData.location.state}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Timeline</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(projectData.timeline.startDate).toLocaleDateString()} - {new Date(projectData.timeline.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment</h3>
            <EquipmentList
              projectDetails={{
                projectType: projectData?.projectType || '',
                startDate: projectData?.timeline?.startDate,
                endDate: projectData?.timeline?.endDate
              }}
              initialSelectedEquipment={formData.selectedEquipment}
              onEquipmentChange={handleEquipmentChange}
            />
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Add any additional notes or special instructions..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBid; 