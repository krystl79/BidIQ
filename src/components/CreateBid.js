import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveBid } from '../services/db';
import EquipmentList from './EquipmentList';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

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
        console.log('Loaded project data:', parsedProject);
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
      const rate = item.selectedRate?.rate || 0;
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
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !projectData) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom color="error">
            {error || 'No Project Selected'}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error ? 'An error occurred while loading the data.' : 'Please select a project to create a bid.'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/projects')}
            sx={{
              bgcolor: '#F9FAFB'
            }}
          >
            Go to Projects
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4, bgcolor: '#fff' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Create New Bid
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Project Information */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Project Information
        </Typography>
        <Box sx={{ mb: 4, p: 3, bgcolor: '#F9FAFB', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 0.5 }}>
                Project Name
              </Typography>
              <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                {projectData.projectName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 0.5 }}>
                Project Type
              </Typography>
              <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                {projectData.projectType}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 0.5 }}>
                Location
              </Typography>
              <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                {projectData.location.city}, {projectData.location.state}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 0.5 }}>
                Timeline
              </Typography>
              <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                {new Date(projectData.timeline.startDate).toLocaleDateString()} - {new Date(projectData.timeline.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Client Information */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Client Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography sx={{ mb: 1 }}>
              Company Name <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="companyName"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={{ mb: 1 }}>
              Contact Name <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="contactName"
              placeholder="Enter contact name"
              value={formData.contactName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={{ mb: 1 }}>
              Email <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={{ mb: 1 }}>
              Phone <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              name="phone"
              placeholder="(XXX) XXX-XXXX"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ mb: 1 }}>Address</Typography>
            <TextField
              fullWidth
              name="address"
              placeholder="Enter street address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 1 }}>City</Typography>
            <TextField
              fullWidth
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 1 }}>State</Typography>
            <FormControl fullWidth>
              <Select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select state
                </MenuItem>
                {states.map(state => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography sx={{ mb: 1 }}>ZIP Code</Typography>
            <TextField
              fullWidth
              name="zipCode"
              placeholder="Enter ZIP code"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>

        {/* Notes */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Add any additional notes or requirements"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </Box>

        {/* Equipment Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Equipment <span style={{ color: '#DC2626' }}>*</span>
          </Typography>
          {projectData && (
            <EquipmentList
              projectDetails={projectData}
              initialSelectedEquipment={formData.selectedEquipment}
              onEquipmentChange={handleEquipmentChange}
            />
          )}
          {formData.selectedEquipment.length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                Total Equipment Cost: ${calculateTotalCost(formData.selectedEquipment).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on selected equipment and project duration
              </Typography>
            </Box>
          )}
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          '& .MuiButton-root': {
            flex: 1,
            py: 1.5
          }
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              bgcolor: '#F9FAFB'
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#3B82F6',
              '&:hover': {
                bgcolor: '#2563EB'
              }
            }}
          >
            Create Bid
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateBid; 