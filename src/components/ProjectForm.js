import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProject } from '../services/db';

const ProjectForm = ({ initialData }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [otherProjectType, setOtherProjectType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [equipmentMarkup, setEquipmentMarkup] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  const projectTypes = [
    'Residential - Single Family',
    'Residential - Multi Family',
    'Commercial - Office',
    'Commercial - Retail',
    'Commercial - Mixed Use',
    'Industrial',
    'Healthcare',
    'Educational',
    'Hospitality',
    'Infrastructure',
    'Renovation/Remodel',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setProjectName(initialData.projectName || '');
      setProjectType(initialData.projectType || '');
      setOtherProjectType(initialData.projectType === 'Other' ? initialData.projectType : '');
      setCity(initialData.location?.city || '');
      setState(initialData.location?.state || '');
      setZipCode(initialData.location?.zipCode || '');
      setStartDate(initialData.timeline?.startDate || '');
      setEndDate(initialData.timeline?.endDate || '');
      setNotes(initialData.notes || '');
      setEquipmentMarkup(initialData.equipmentMarkup || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields - removed location fields from required validation
    if (!projectName || !projectType || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (startDateObj > endDateObj) {
      setError('End date must be after start date');
      return;
    }

    const location = {
      city: city || '',
      state: state || '',
      zipCode: zipCode || ''
    };

    const timeline = {
      startDate,
      startTime,
      endDate,
      endTime
    };

    const projectDetails = {
      id: initialData?.id || Date.now().toString(),
      projectName,
      projectType: projectType === 'Other' ? otherProjectType : projectType,
      location,
      timeline,
      notes,
      equipmentMarkup: parseFloat(equipmentMarkup) || 0,
      createdAt: new Date().toISOString(),
      bids: initialData?.bids || []
    };

    try {
      // Save project to database
      await saveProject(projectDetails);
      
      // Clear form
      setProjectName('');
      setProjectType('');
      setOtherProjectType('');
      setCity('');
      setState('');
      setZipCode('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setNotes('');
      setEquipmentMarkup('');
      setError(null);
      
      // Navigate to projects list
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleCancel = () => {
    // Clear all form fields
    setProjectName('');
    setProjectType('');
    setOtherProjectType('');
    setCity('');
    setState('');
    setZipCode('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setNotes('');
    setEquipmentMarkup('');
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  const inputClassName = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-blue-200 bg-white shadow-sm";
  const buttonClassName = "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg active:transform active:scale-[0.99]";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {initialData ? 'Edit Project' : 'Create New Project'}
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input 
              id="projectName"
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              placeholder="Enter project name"
              required
              className={inputClassName}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="projectType"
              value={projectType} 
              onChange={(e) => setProjectType(e.target.value)} 
              required
              className={inputClassName}
            >
              <option value="">Select a project type</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {projectType === 'Other' && (
            <div className="space-y-1">
              <label htmlFor="otherProjectType" className="block text-sm font-medium text-gray-700">
                Specify Project Type <span className="text-red-500">*</span>
              </label>
              <input
                id="otherProjectType"
                type="text"
                value={otherProjectType}
                onChange={(e) => setOtherProjectType(e.target.value)}
                placeholder="Enter project type"
                required
                className={inputClassName}
              />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input 
                  id="city"
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className={inputClassName}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={inputClassName}
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
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  pattern="[0-9]{5}"
                  maxLength="5"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  required
                  className={inputClassName}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End <span className="text-red-500">*</span>
                </label>
                <input 
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  required
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Notes</h3>
            <textarea 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Enter additional notes" 
              rows="4"
              maxLength={250}
              className={inputClassName}
            />
            {notes.length > 0 && (
              <div className="mt-1 text-[10px] text-gray-500 text-right italic">
                {notes.length}/250 characters
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Internal Project Details</h3>
            <div className="space-y-1">
              <label htmlFor="equipmentMarkup" className="block text-sm font-medium text-gray-700">
                Equipment Markup % <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="equipmentMarkup"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={equipmentMarkup}
                  onChange={(e) => setEquipmentMarkup(e.target.value)}
                  placeholder="Enter markup percentage"
                  required
                  className={inputClassName + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Enter the markup percentage for equipment (0-100)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 mb-8">
          <button 
            type="button"
            onClick={handleCancel}
            className={`${buttonClassName} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`${buttonClassName} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500`}
          >
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
