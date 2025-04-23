import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProject } from '../services/db';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';

const ProjectForm = ({ initialData }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [projectType, setProjectType] = useState(initialData?.projectType || '');
  const [city, setCity] = useState(initialData?.location?.city || '');
  const [state, setState] = useState(initialData?.location?.state || '');
  const [zipCode, setZipCode] = useState(initialData?.location?.zipCode || '');
  const [startDate, setStartDate] = useState(initialData?.timeline?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(initialData?.timeline?.endDate?.split('T')[0] || '');
  const [equipmentMarkup, setEquipmentMarkup] = useState(initialData?.equipmentMarkup || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        id: initialData?.id || Date.now().toString(),
        projectName,
        projectType,
        location: {
          city,
          state,
          zipCode
        },
        timeline: {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        },
        equipmentMarkup: parseFloat(equipmentMarkup) || 0,
        notes,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveProject(projectData);
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4, bgcolor: '#fff' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Create New Project
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Typography sx={{ mb: 1 }}>
          Project Name <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <Typography sx={{ mb: 1 }}>
          Project Type <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <Select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            displayEmpty
            required
          >
            <MenuItem value="" disabled>
              Select a project type
            </MenuItem>
            {projectTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Project Location
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>City</Typography>
            <TextField
              fullWidth
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>State</Typography>
            <FormControl fullWidth>
              <Select
                value={state}
                onChange={(e) => setState(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select state
                </MenuItem>
                {states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>ZIP Code</Typography>
            <TextField
              fullWidth
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Project Timeline
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>
              Start <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              placeholder="mm/dd/yyyy"
              InputProps={{
                inputProps: { placeholder: 'mm/dd/yyyy' }
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ mb: 1 }}>
              End <span style={{ color: '#DC2626' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              placeholder="mm/dd/yyyy"
              InputProps={{
                inputProps: { placeholder: 'mm/dd/yyyy' }
              }}
            />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Project Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter additional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Internal Project Details
        </Typography>
        <Typography sx={{ mb: 1 }}>
          Equipment Markup % <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter markup percentage"
          value={equipmentMarkup}
          onChange={(e) => setEquipmentMarkup(e.target.value)}
          required
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>
          }}
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Enter the markup percentage for equipment (0-100)
        </Typography>

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
            Save Project
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectForm;
