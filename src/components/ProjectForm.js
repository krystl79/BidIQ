import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProject } from '../services/db';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';

const ProjectForm = ({ initialData }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [projectType, setProjectType] = useState(initialData?.projectType || '');
  const [otherProjectType, setOtherProjectType] = useState(initialData?.otherProjectType || '');
  const [city, setCity] = useState(initialData?.location?.city || '');
  const [state, setState] = useState(initialData?.location?.state || '');
  const [zipCode, setZipCode] = useState(initialData?.location?.zipCode || '');
  const [startDate, setStartDate] = useState(initialData?.timeline?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(initialData?.timeline?.endDate?.split('T')[0] || '');
  const [equipmentMarkup, setEquipmentMarkup] = useState(initialData?.equipmentMarkup || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Commercial',
    'Residential',
    'Industrial',
    'Infrastructure',
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
    setError('');
    setLoading(true);

    try {
      const projectData = {
        projectName,
        projectType: projectType === 'Other' ? otherProjectType : projectType,
        location: {
          city,
          state,
          zipCode
        },
        timeline: {
          startDate,
          endDate
        },
        equipmentMarkup: parseFloat(equipmentMarkup),
        notes
      };

      await saveProject(projectData, initialData?.id);
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {initialData ? 'Edit Project' : 'Create New Project'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  label="Project Type"
                  required
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {projectType === 'Other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specify Project Type"
                  value={otherProjectType}
                  onChange={(e) => setOtherProjectType(e.target.value)}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Location
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  label="State"
                >
                  {states.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Timeline
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter additional notes"
                inputProps={{ maxLength: 250 }}
              />
              {notes.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                  {notes.length}/250 characters
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Internal Project Details
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Equipment Markup %"
                value={equipmentMarkup}
                onChange={(e) => setEquipmentMarkup(e.target.value)}
                required
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                helperText="Enter the markup percentage for equipment (0-100)"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectForm;
