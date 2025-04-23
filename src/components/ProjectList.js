import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllProjects, deleteProject, getBidsByProject } from '../services/db';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Add,
  Visibility
} from '@mui/icons-material';

const ProjectList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectBidCounts, setProjectBidCounts] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const allProjects = await getAllProjects();
      
      const sortedProjects = allProjects.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const projectsWithBidCounts = await Promise.all(
        sortedProjects.map(async (project) => {
          const bids = await getBidsByProject(project.id);
          return {
            ...project,
            bidCount: bids.length
          };
        })
      );
      
      setProjects(projectsWithBidCounts);
      setProjectBidCounts(projectsWithBidCounts.reduce((acc, project) => ({
        ...acc,
        [project.id]: project.bidCount
      }), {}));
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Error loading projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/create-project');
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleCreateBid = (project) => {
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    navigate(`/projects/${project.id}/bids/new`);
  };

  const handleDeleteProject = async (projectId) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProject(projectToDelete);
      loadProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Error deleting project. Please try again later.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 400,
              color: '#111827'
            }}
          >
            Projects
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleCreateProject}
            sx={{ 
              bgcolor: '#3B82F6',
              borderRadius: '9999px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.125rem',
              '&:hover': {
                bgcolor: '#2563EB',
              },
            }}
          >
            Create Project
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          placeholder="Search projects by project or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ 
            mb: 4,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#E5E7EB',
              },
              '&:hover fieldset': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: '16px',
              fontSize: '1rem',
              '&::placeholder': {
                color: '#9CA3AF',
                opacity: 1,
              },
            },
          }}
        />

        {filteredProjects.length === 0 && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8
          }}>
            <Typography
              variant="h5"
              sx={{
                color: '#6B7280',
                fontWeight: 400
              }}
            >
              No projects found.
            </Typography>
          </Box>
        )}

        {filteredProjects.length > 0 && (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{ 
                  boxShadow: 2,
                  transition: '0.3s',
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: '#111827',
                        fontWeight: 600
                      }}
                    >
                      {project.projectName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={project.projectType} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`${projectBidCounts[project.id] || 0} Bids`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      Location: {project.location.city}, {project.location.state}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Timeline: {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Equipment Markup: {project.equipmentMarkup}%
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewProject(project)}
                      title="View Project"
                      sx={{ 
                        color: '#4F46E5',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 70, 229, 0.04)',
                        },
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCreateBid(project)}
                      title="Create Bid"
                      sx={{ 
                        color: '#4F46E5',
                        '&:hover': {
                          backgroundColor: 'rgba(79, 70, 229, 0.04)',
                        },
                      }}
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete Project"
                      sx={{ 
                        color: '#EF4444',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this project? This will also delete all associated bids. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProjectList; 