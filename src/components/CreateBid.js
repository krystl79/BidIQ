import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, saveBid, getBid } from '../services/db';
import EquipmentList from './EquipmentList';

const CreateBid = () => {
  const navigate = useNavigate();
  const { bidId } = useParams();
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
  const [editingBidId, setEditingBidId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleEquipmentSelect = (selectedEquipment) => {
    setFormData(prev => ({
      ...prev,
      selectedEquipment
    }));
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length === 10;
  };

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
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {isEditing ? 'Edit Bid' : 'Create New Bid'}
        </h2>

        {/* Project Details Section */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Project Name</p>
              <p className="font-medium">{projectData.projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project Type</p>
              <p className="font-medium">{projectData.projectType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {projectData.location.city}, {projectData.location.state} {projectData.location.zipCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeline</p>
              <p className="font-medium">
                {new Date(projectData.timeline.startDate).toLocaleDateString()} - {new Date(projectData.timeline.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Client Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={formData.contactName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="(XXX) XXX-XXXX"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select state</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                pattern="[0-9]{5}"
                maxLength="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Equipment Selection Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Equipment Selection</h3>
          <EquipmentList
            projectDetails={projectData}
            onEquipmentSelect={handleEquipmentSelect}
            initialSelectedEquipment={formData.selectedEquipment}
          />
        </div>

        {/* Additional Notes Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes or terms"
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/bids')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Update Bid' : 'Create Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBid; 