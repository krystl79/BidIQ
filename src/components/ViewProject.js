import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getBidsByProject } from '../services/db';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';

const ViewProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Load project data
        const project = await getProject(projectId);
        if (!project) {
          setError('Project not found');
          setIsLoading(false);
          return;
        }

        // Load bids for this project
        const projectBids = await getBidsByProject(projectId);
        
        setProjectData(project);
        setBids(projectBids);
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Error loading project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleCreateBid = () => {
    // Store current project in session storage for bid creation
    sessionStorage.setItem('currentProject', JSON.stringify(projectData));
    navigate(`/projects/${projectId}/bids/new`);
  };

  const handleViewBids = () => {
    navigate(`/projects/${projectId}/bids`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !projectData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom color="error">
            {error || 'Project Not Found'}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error ? 'An error occurred while loading the project.' : 'The project you\'re looking for could not be found.'}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back to Projects
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {projectData.projectName}
              </Typography>
              <Typography color="text.secondary">
                Created: {new Date(projectData.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
              >
                Back to Projects
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateBid}
                color="primary"
              >
                Create New Bid
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Project Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  Project Type
                </Typography>
                <Typography>{projectData.projectType}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  Location
                </Typography>
                <Typography>
                  {projectData.location.city}, {projectData.location.state} {projectData.location.zipCode}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  Timeline
                </Typography>
                <Typography>
                  {new Date(projectData.timeline.startDate).toLocaleDateString()} - {new Date(projectData.timeline.endDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  Equipment Markup
                </Typography>
                <Typography>{projectData.equipmentMarkup}%</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  Bids
                </Typography>
                <Button
                  onClick={handleViewBids}
                  startIcon={<Chip label={bids.length} size="small" />}
                  color="primary"
                >
                  View Bids
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Notes */}
          {projectData.notes && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {projectData.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ViewProject; 