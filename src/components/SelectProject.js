import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProjects } from '../services/db';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';

const SelectProject = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    // Store selected project in session storage
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    // Navigate to create bid page
    navigate(`/projects/${project.id}/bids/new`);
  };

  const filteredProjects = projects.filter(project =>
    project.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location?.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Select Project for Bid
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/bids')}
          >
            Back to Bids
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search projects by name, type, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'grid', gap: 2 }}>
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handleSelectProject(project)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.projectName}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {project.projectType}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {project.location?.city}, {project.location?.state}
                </Typography>
                <Typography color="text.secondary">
                  {project.timeline?.startDate && new Date(project.timeline.startDate).toLocaleDateString()} 
                  {project.timeline?.endDate && ` - ${new Date(project.timeline.endDate).toLocaleDateString()}`}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">
                {searchQuery ? 'No projects match your search.' : 'No projects found.'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SelectProject; 