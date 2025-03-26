import React, { useState, useEffect } from 'react';

const EquipmentList = ({ projectDetails, onEquipmentSelect, initialSelectedEquipment = [] }) => {
  const [selectedEquipment, setSelectedEquipment] = useState(initialSelectedEquipment);

  // Update local state when initialSelectedEquipment changes
  useEffect(() => {
    if (initialSelectedEquipment.length > 0) {
      // If we have initial equipment, use it as is
      setSelectedEquipment(initialSelectedEquipment);
      // Notify parent component about the initial equipment
      if (onEquipmentSelect) {
        onEquipmentSelect(initialSelectedEquipment);
      }
    }
  }, [initialSelectedEquipment, onEquipmentSelect]);

  // Calculate project duration in days
  const calculateProjectDuration = () => {
    if (!projectDetails?.timeline?.startDate || !projectDetails?.timeline?.endDate) return 0;
    const start = new Date(projectDetails.timeline.startDate);
    const end = new Date(projectDetails.timeline.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Determine the best rate based on project duration
  const getBestRate = (equipment) => {
    const duration = calculateProjectDuration();
    if (duration <= 7) return { type: 'daily', rate: equipment.rates.daily };
    if (duration <= 30) return { type: 'weekly', rate: equipment.rates.weekly };
    return { type: 'monthly', rate: equipment.rates.monthly };
  };

  // Define all available equipment with their details and rates
  const allEquipment = [
    // Residential - Single Family
    {
      id: 'excavator-20t',
      name: '20-ton Excavator',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 1200,
        weekly: 6000,
        monthly: 20000
      },
      description: 'Heavy-duty excavator for digging and site preparation'
    },
    {
      id: 'bulldozer-d6',
      name: 'D6 Bulldozer',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 1000,
        weekly: 5000,
        monthly: 18000
      },
      description: 'Versatile bulldozer for grading and site clearing'
    },
    {
      id: 'crane-25t',
      name: '25-ton Mobile Crane',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 1500,
        weekly: 7500,
        monthly: 25000
      },
      description: 'Mobile crane for lifting and material handling'
    },
    {
      id: 'concrete-pump',
      name: 'Concrete Pump Truck',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 800,
        weekly: 4000,
        monthly: 15000
      },
      description: 'Pump truck for concrete placement'
    },
    {
      id: 'scissor-lift',
      name: 'Scissor Lift',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 200,
        weekly: 1000,
        monthly: 3500
      },
      description: 'Aerial work platform for elevated access'
    },
    {
      id: 'forklift',
      name: 'Forklift',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 300,
        weekly: 1500,
        monthly: 5000
      },
      description: 'Material handling and lifting equipment'
    },
    {
      id: 'generator-100kva',
      name: '100kVA Generator',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 400,
        weekly: 2000,
        monthly: 7000
      },
      description: 'Backup power supply for construction site'
    },
    {
      id: 'compactor',
      name: 'Plate Compactor',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 150,
        weekly: 750,
        monthly: 2500
      },
      description: 'Soil and gravel compaction equipment'
    },
    {
      id: 'water-pump',
      name: 'Water Pump',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 100,
        weekly: 500,
        monthly: 1800
      },
      description: 'Site dewatering and water management'
    },
    {
      id: 'air-compressor',
      name: 'Air Compressor',
      projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 150,
        weekly: 750,
        monthly: 2500
      },
      description: 'Power source for pneumatic tools'
    },
    // Specialized equipment for specific project types
    {
      id: 'tower-crane',
      name: 'Tower Crane',
      projectTypes: ['Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality'],
      rates: {
        daily: 2500,
        weekly: 12000,
        monthly: 40000
      },
      description: 'High-rise construction crane'
    },
    {
      id: 'drill-rig',
      name: 'Drill Rig',
      projectTypes: ['Infrastructure', 'Industrial'],
      rates: {
        daily: 3000,
        weekly: 15000,
        monthly: 50000
      },
      description: 'Foundation drilling equipment'
    },
    {
      id: 'asphalt-paver',
      name: 'Asphalt Paver',
      projectTypes: ['Infrastructure', 'Commercial - Retail'],
      rates: {
        daily: 2000,
        weekly: 10000,
        monthly: 35000
      },
      description: 'Road and parking lot paving equipment'
    },
    {
      id: 'demolition-hammer',
      name: 'Demolition Hammer',
      projectTypes: ['Renovation/Remodel', 'Commercial - Mixed Use'],
      rates: {
        daily: 300,
        weekly: 1500,
        monthly: 5000
      },
      description: 'Heavy-duty demolition equipment'
    },
    {
      id: 'scaffolding',
      name: 'Scaffolding System',
      projectTypes: ['Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
      rates: {
        daily: 500,
        weekly: 2500,
        monthly: 8000
      },
      description: 'Temporary structure for construction access'
    }
  ];

  // Filter equipment based on project type
  const filteredEquipment = allEquipment.filter(equipment => 
    equipment.projectTypes.includes(projectDetails?.projectType || '')
  );

  const handleEquipmentSelect = (equipment) => {
    const bestRate = getBestRate(equipment);
    setSelectedEquipment(prev => [...prev, { 
      ...equipment, 
      selectedRate: bestRate.type,
      quantity: 1 // Set default quantity to 1
    }]);
  };

  const handleRateChange = (equipmentId, rateType) => {
    setSelectedEquipment(prev => prev.map(eq => 
      eq.id === equipmentId ? { ...eq, selectedRate: rateType } : eq
    ));
  };

  const handleRemoveEquipment = (equipmentId) => {
    setSelectedEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
  };

  const handleQuantityChange = (equipmentId, quantity) => {
    if (quantity < 1) return;
    setSelectedEquipment(prev => prev.map(eq => 
      eq.id === equipmentId ? { ...eq, quantity } : eq
    ));
  };

  // Add a function to get the current selected equipment
  const getSelectedEquipment = () => {
    return selectedEquipment;
  };

  // Only notify parent when equipment is explicitly added or removed
  useEffect(() => {
    if (onEquipmentSelect) {
      onEquipmentSelect(selectedEquipment);
    }
  }, [selectedEquipment, onEquipmentSelect]); // Update when selectedEquipment changes

  const projectDuration = calculateProjectDuration();
  const durationText = projectDuration <= 7 ? 'Daily' : projectDuration <= 30 ? 'Weekly' : 'Monthly';

  return (
    <div className="space-y-6">
      {/* Available Equipment Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{equipment.name}</h5>
                  <p className="text-sm text-gray-500">{equipment.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEquipmentSelect(equipment);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Daily: ${equipment.rates.daily}</p>
                <p>Weekly: ${equipment.rates.weekly}</p>
                <p>Monthly: ${equipment.rates.monthly}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Equipment Section */}
      {selectedEquipment.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Selected Equipment</h4>
    <div className="space-y-4">
            {selectedEquipment.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{equipment.name}</h5>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Rate Type:</label>
                        <select
                          value={equipment.selectedRate}
                          onChange={(e) => handleRateChange(equipment.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="daily">Daily (${equipment.rates.daily})</option>
                          <option value="weekly">Weekly (${equipment.rates.weekly})</option>
                          <option value="monthly">Monthly (${equipment.rates.monthly})</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={equipment.quantity || 1}
                          onChange={(e) => handleQuantityChange(equipment.id, parseInt(e.target.value))}
                          className="text-sm w-20 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEquipment(equipment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
