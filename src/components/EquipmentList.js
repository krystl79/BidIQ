import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Define allEquipment array before the component
const allEquipment = [
  // General Construction Equipment (Available for all project types)
  {
    id: 'excavator-20t',
    name: '20-ton Excavator',
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
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
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
    projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
    rates: {
      daily: 150,
      weekly: 750,
      monthly: 2500
    },
    description: 'Power source for pneumatic tools'
  },
  {
    id: 'scaffolding',
    name: 'Scaffolding System',
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
    projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
    rates: {
      daily: 500,
      weekly: 2500,
      monthly: 8000
    },
    description: 'Temporary structure for construction access'
  },
  {
    id: 'concrete-mixer',
    name: 'Concrete Mixer',
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
    projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
    rates: {
      daily: 200,
      weekly: 800,
      monthly: 2500
    },
    description: 'Concrete mixing equipment for foundation and structural work'
  },
  {
    id: 'demolition-hammer',
    name: 'Demolition Hammer',
    image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg',
    projectTypes: ['Residential - Single Family', 'Residential - Multi Family', 'Commercial - Office', 'Commercial - Retail', 'Commercial - Mixed Use', 'Industrial', 'Healthcare', 'Educational', 'Hospitality', 'Infrastructure', 'Renovation/Remodel'],
    rates: {
      daily: 300,
      weekly: 1500,
      monthly: 5000
    },
    description: 'Heavy-duty demolition equipment'
  }
];

const EquipmentList = ({ projectDetails, initialSelectedEquipment = [], onEquipmentChange }) => {
  const [selectedEquipment, setSelectedEquipment] = useState(initialSelectedEquipment);

  // Update selected equipment only when initialSelectedEquipment changes
  useEffect(() => {
    setSelectedEquipment(initialSelectedEquipment);
  }, [initialSelectedEquipment]);

  // Calculate project duration
  const calculateProjectDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // Get best rate based on project duration
  const getBestRate = useCallback((equipment, duration) => {
    if (duration >= 30) return equipment.rates.monthly;
    if (duration >= 7) return equipment.rates.weekly;
    return equipment.rates.daily;
  }, []);

  // Memoize filtered equipment list
  const filteredEquipment = useMemo(() => {
    if (!projectDetails?.projectType) {
      console.log('No project type selected');
      return [];
    }
    const projectType = projectDetails.projectType.trim();
    console.log('Filtering equipment for project type:', projectType);
    
    const filtered = allEquipment.filter(equipment => {
      const matches = equipment.projectTypes.some(type => 
        type.trim().toLowerCase() === projectType.toLowerCase()
      );
      console.log(`Equipment ${equipment.name}: ${matches ? 'matches' : 'does not match'} project type ${projectType}`);
      return matches;
    });
    
    console.log('Filtered equipment:', filtered);
    return filtered;
  }, [projectDetails?.projectType]);

  // Memoize handlers
  const handleEquipmentSelect = useCallback((equipment) => {
    const duration = calculateProjectDuration(projectDetails?.startDate, projectDetails?.endDate);
    const bestRate = getBestRate(equipment, duration);
    
    setSelectedEquipment(prev => {
      const newEquipment = [...prev, {
        ...equipment,
        quantity: 1,
        rate: bestRate,
        rateType: duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily'
      }];
      onEquipmentChange(newEquipment);
      return newEquipment;
    });
  }, [projectDetails?.startDate, projectDetails?.endDate, calculateProjectDuration, getBestRate, onEquipmentChange]);

  const handleRateChange = useCallback((equipmentId, rateType) => {
    setSelectedEquipment(prev => {
      const newEquipment = prev.map(item => {
        if (item.id === equipmentId) {
          return {
            ...item,
            rate: item.rates[rateType],
            rateType
          };
        }
        return item;
      });
      onEquipmentChange(newEquipment);
      return newEquipment;
    });
  }, [onEquipmentChange]);

  const handleRemoveEquipment = useCallback((equipmentId) => {
    setSelectedEquipment(prev => {
      const newEquipment = prev.filter(item => item.id !== equipmentId);
      onEquipmentChange(newEquipment);
      return newEquipment;
    });
  }, [onEquipmentChange]);

  const handleQuantityChange = useCallback((equipmentId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedEquipment(prev => {
      const newEquipment = prev.map(item => {
        if (item.id === equipmentId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      onEquipmentChange(newEquipment);
      return newEquipment;
    });
  }, [onEquipmentChange]);

  const getSelectedEquipment = useCallback(() => {
    return selectedEquipment;
  }, [selectedEquipment]);

  // Calculate project duration in days
  const calculateProjectDurationDays = () => {
    if (!projectDetails?.timeline?.startDate || !projectDetails?.timeline?.endDate) return 0;
    const start = new Date(projectDetails.timeline.startDate);
    const end = new Date(projectDetails.timeline.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Determine the best rate based on project duration
  const getBestRateDays = (equipment) => {
    const duration = calculateProjectDurationDays();
    if (duration <= 7) return { type: 'daily', rate: equipment.rates.daily };
    if (duration <= 30) return { type: 'weekly', rate: equipment.rates.weekly };
    return { type: 'monthly', rate: equipment.rates.monthly };
  };

  const projectDuration = calculateProjectDurationDays();
  const durationText = projectDuration <= 7 ? 'Daily' : projectDuration <= 30 ? 'Weekly' : 'Monthly';

  return (
    <div className="space-y-6">
      {/* Available Equipment Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Equipment</h3>
        {filteredEquipment.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {projectDetails?.projectType 
              ? 'No equipment available for this project type'
              : 'Please select a project type to view recommended equipment'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((equipment) => (
              <div key={equipment.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={equipment.image}
                    alt={equipment.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900">{equipment.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{equipment.description}</p>
                  
                  {/* Rates Section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-medium text-gray-900">${equipment.rates.daily.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Weekly Rate:</span>
                      <span className="font-medium text-gray-900">${equipment.rates.weekly.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Monthly Rate:</span>
                      <span className="font-medium text-gray-900">${equipment.rates.monthly.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleEquipmentSelect(equipment)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Equipment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Equipment Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Equipment</h3>
        <div className="min-h-[200px] space-y-4">
          {selectedEquipment.map(equipment => (
            <div
              key={equipment.id}
              className="border rounded-lg p-4 transition-all duration-200 ease-in-out"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{equipment.description}</p>
                </div>
                <button
                  onClick={() => handleRemoveEquipment(equipment.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={equipment.quantity}
                    onChange={(e) => handleQuantityChange(equipment.id, parseInt(e.target.value) || 1)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate Type</label>
                  <select
                    value={equipment.rateType}
                    onChange={(e) => handleRateChange(equipment.id, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Rate: ${equipment.rate.toLocaleString()} per {equipment.rateType}
              </div>
            </div>
          ))}
          {selectedEquipment.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No equipment selected. Please add equipment from the list above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;
