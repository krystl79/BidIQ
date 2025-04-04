import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ProjectData {
  name: string;
  location: string;
  type: string;
  size: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string;
}

const projectTypes = [
  'Site Preparation',
  'Commercial Construction',
  'Road Work',
  'Demolition',
  'Landscaping',
  'Industrial Construction',
  'Residential Development',
  'Infrastructure',
];

const ProjectInput: React.FC = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    location: '',
    type: '',
    size: '',
    startDate: null,
    endDate: null,
    notes: '',
  });

  const handleChange = (field: keyof ProjectData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProjectData({
      ...projectData,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setProjectData({
      ...projectData,
      [field]: date,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here we would typically save the project data to state management or backend
    navigate('/equipment-selection');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={0} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Project Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Equipment Selection</StepLabel>
            </Step>
            <Step>
              <StepLabel>Review & Generate Bid</StepLabel>
            </Step>
          </Stepper>

          <Typography variant="h4" gutterBottom>
            Project Information
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Enter the details of your project to get started with equipment rental estimates.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Name"
                  value={projectData.name}
                  onChange={handleChange('name')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Location (City, State or ZIP)"
                  value={projectData.location}
                  onChange={handleChange('location')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Project Type"
                  value={projectData.type}
                  onChange={handleChange('type')}
                >
                  {projectTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Size (Square Footage, Acres, or Linear Feet)"
                  value={projectData.size}
                  onChange={handleChange('size')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={projectData.startDate}
                  onChange={handleDateChange('startDate')}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={projectData.endDate}
                  onChange={handleDateChange('endDate')}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Additional Notes"
                  value={projectData.notes}
                  onChange={handleChange('notes')}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!projectData.name || !projectData.location || !projectData.type || !projectData.size || !projectData.startDate || !projectData.endDate}
                  >
                    Next: Select Equipment
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default ProjectInput; 