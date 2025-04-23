import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Paper
} from '@mui/material';

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
      return allEquipment; // Show all equipment if no project type is selected
    }
    const projectType = projectDetails.projectType.trim();
    console.log('Current project type:', projectType);
    
    const filtered = allEquipment.filter(equipment => {
      const matches = equipment.projectTypes.some(type => 
        type.toLowerCase().includes(projectType.toLowerCase()) ||
        projectType.toLowerCase().includes(type.toLowerCase())
      );
      return matches;
    });

    console.log('Number of filtered equipment:', filtered.length);
    return filtered.length > 0 ? filtered : allEquipment; // Show all equipment if no matches found
  }, [projectDetails?.projectType]);

  // Handle equipment selection
  const handleEquipmentSelect = (equipment) => {
    const duration = calculateProjectDuration(
      projectDetails?.timeline?.startDate,
      projectDetails?.timeline?.endDate
    );
    
    const bestRate = getBestRate(equipment, duration);
    
    const updatedEquipment = {
      ...equipment,
      selectedRate: {
        type: duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily',
        rate: bestRate
      }
    };

    const newSelectedEquipment = [...selectedEquipment, updatedEquipment];
    setSelectedEquipment(newSelectedEquipment);
    
    if (onEquipmentChange) {
      onEquipmentChange(newSelectedEquipment);
    }
  };

  // Handle equipment removal
  const handleRemoveEquipment = (equipmentId) => {
    const newSelectedEquipment = selectedEquipment.filter(
      (item) => item.id !== equipmentId
    );
    setSelectedEquipment(newSelectedEquipment);
    
    if (onEquipmentChange) {
      onEquipmentChange(newSelectedEquipment);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Selected Equipment Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Selected Equipment
        </Typography>
        {selectedEquipment.length === 0 ? (
          <Typography color="text.secondary">No equipment selected</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedEquipment.map((equipment) => (
              <Paper
                key={equipment.id}
                sx={{
                  p: 2,
                  bgcolor: '#F9FAFB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {equipment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {equipment.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#2563EB', mt: 0.5, fontWeight: 500 }}
                  >
                    Rate: ${equipment.selectedRate.rate} ({equipment.selectedRate.type})
                  </Typography>
                </Box>
                <Button
                  color="error"
                  onClick={() => handleRemoveEquipment(equipment.id)}
                >
                  Remove
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Available Equipment Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recommended Equipment
        </Typography>
        <Grid container spacing={3}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} sm={6} md={4} key={equipment.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={equipment.image}
                  alt={equipment.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg';
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {equipment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {equipment.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Daily Rate:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        ${equipment.rates.daily.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Weekly Rate:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        ${equipment.rates.weekly.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Rate:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        ${equipment.rates.monthly.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleEquipmentSelect(equipment)}
                    sx={{
                      mt: 2,
                      bgcolor: '#3B82F6',
                      '&:hover': {
                        bgcolor: '#2563EB'
                      }
                    }}
                  >
                    Add Equipment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default EquipmentList;
