import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, updateProject, getBidsByProject, saveBid } from '../services/db';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    timeline: {
      startDate: '',
      endDate: ''
    },
    equipmentMarkup: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidUpdateDialog, setShowBidUpdateDialog] = useState(false);
  const [pendingProjectUpdate, setPendingProjectUpdate] = useState(null);
  const [bids, setBids] = useState([]);

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
        const project = await getProject(projectId);
        if (!project) {
          setError('Project not found');
          return;
        }
        
        // Load project bids
        const projectBids = await getBidsByProject(projectId);
        setBids(projectBids);
        
        setFormData({
          ...project,
          timeline: {
            startDate: project.timeline.startDate.split('T')[0],
            endDate: project.timeline.endDate.split('T')[0]
          }
        });
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'equipmentMarkup' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!formData.projectName || !formData.projectType || 
          !formData.location.city || !formData.location.state || 
          !formData.timeline.startDate || !formData.timeline.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate dates
      const startDate = new Date(formData.timeline.startDate);
      const endDate = new Date(formData.timeline.endDate);
      if (endDate < startDate) {
        setError('End date cannot be before start date');
        return;
      }

      // Validate markup percentage
      if (formData.equipmentMarkup < 0) {
        setError('Equipment markup cannot be negative');
        return;
      }

      // Format dates for storage
      const projectData = {
        ...formData,
        timeline: {
          startDate: new Date(formData.timeline.startDate).toISOString(),
          endDate: new Date(formData.timeline.endDate).toISOString()
        }
      };

      // If there are existing bids, show the update dialog
      if (bids.length > 0) {
        setPendingProjectUpdate(projectData);
        setShowBidUpdateDialog(true);
      } else {
        // If no bids, just update the project
        await updateProject(projectId, projectData);
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const handleUpdateConfirmation = async (shouldUpdateBids) => {
    try {
      // Update the project
      await updateProject(projectId, pendingProjectUpdate);

      // If user chose to update bids, update each bid with new project details
      if (shouldUpdateBids) {
        await Promise.all(bids.map(async (bid) => {
          const updatedBid = {
            ...bid,
            projectName: pendingProjectUpdate.projectName,
            projectType: pendingProjectUpdate.projectType,
            location: pendingProjectUpdate.location,
            timeline: pendingProjectUpdate.timeline,
            equipmentMarkup: pendingProjectUpdate.equipmentMarkup
          };
          await saveBid(updatedBid);
        }));
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error updating project and bids:', error);
      setError('Failed to update project and bids');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Edit Project
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Type"
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="State"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                required
              >
                {states.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleInputChange}
                required
                inputProps={{ pattern: '[0-9]{5}' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="timeline.startDate"
                value={formData.timeline.startDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="timeline.endDate"
                value={formData.timeline.endDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Equipment Markup (%)"
                name="equipmentMarkup"
                value={formData.equipmentMarkup}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        <Dialog
          open={showBidUpdateDialog}
          onClose={() => setShowBidUpdateDialog(false)}
        >
          <DialogTitle>Update Existing Bids?</DialogTitle>
          <DialogContent>
            <Typography>
              This project has {bids.length} existing bid{bids.length !== 1 ? 's' : ''}. Would you like to update {bids.length !== 1 ? 'them' : 'it'} with the new project details?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleUpdateConfirmation(false)}>
              No, Keep Existing Bids
            </Button>
            <Button onClick={() => handleUpdateConfirmation(true)} color="primary">
              Yes, Update Bids
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default EditProject; 