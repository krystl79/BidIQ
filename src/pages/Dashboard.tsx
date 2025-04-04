import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import apiService from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalCost: number;
}

interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface Quote {
  id: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  projectType: string;
  requirements: string[];
  equipmentSuggestions: string[];
  size?: string;
  notes?: string;
  leadConsent?: boolean;
  totalCost: number;
  createdAt: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  quoteId: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, quoteId }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      setLoading(true);
      await apiService.shareQuote(quoteId, email, message);
      setSuccess(true);
      onClose();
    } catch (err) {
      setError('Failed to share quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Quote</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Recipient Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleShare}
          variant="contained"
          disabled={loading || !email}
        >
          Share
        </Button>
      </DialogActions>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadProjects();
    loadProfile();
    loadQuotes();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Office Building Construction',
          description: 'New office building construction project',
          status: 'pending',
          createdAt: '2024-03-26',
          totalCost: 25000,
        },
        {
          id: '2',
          name: 'Road Maintenance',
          description: 'Highway maintenance project',
          status: 'approved',
          createdAt: '2024-03-25',
          totalCost: 15000,
        },
      ];
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      // Replace with actual API call
      const mockProfile: UserProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ABC Construction',
        phone: '(555) 123-4567',
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const quotesData = await apiService.getQuotes();
      setQuotes(quotesData);
    } catch (err) {
      setError('Failed to load quotes');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewQuote = () => {
    navigate('/project-input');
  };

  const handleEditProject = (project: Project) => {
    navigate(`/equipment-selection`, { state: { project } });
  };

  const handleDeleteProject = async (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    try {
      // Replace with actual API call
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, quote: Quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleAppBarMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const handleEdit = () => {
    if (selectedQuote) {
      navigate(`/project-input?quoteId=${selectedQuote.id}`);
      handleMenuClose();
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handleDownload = async () => {
    if (selectedQuote) {
      try {
        await apiService.downloadQuote(selectedQuote.id);
        setSnackbar({
          open: true,
          message: 'Quote downloaded successfully',
          severity: 'success',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to download quote',
          severity: 'error',
        });
      }
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    if (selectedQuote) {
      try {
        await apiService.deleteQuote(selectedQuote.id);
        setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
        setSnackbar({
          open: true,
          message: 'Quote deleted successfully',
          severity: 'success',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete quote',
          severity: 'error',
        });
      }
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const handleLogout = () => {
    apiService.logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Build IQ Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} sx={{ mr: 2 }}>
            <LogoutIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleAppBarMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4">Dashboard</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton onClick={() => setIsProfileDialogOpen(true)}>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewQuote}
                >
                  Create New Quote
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Search and Stats */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Projects
                  </Typography>
                  <Typography variant="h4">{projects.length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Quotes
                  </Typography>
                  <Typography variant="h4">
                    {projects.filter(p => p.status === 'pending').length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Projects List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Projects
              </Typography>
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} key={project.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {project.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                              />
                              <Typography variant="body2" color="text.secondary">
                                Created: {new Date(project.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="h6" color="primary">
                              ${project.totalCost.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton onClick={() => handleEditProject(project)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteProject(project)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onClose={() => setIsProfileDialogOpen(false)}>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogContent>
            {profile && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profile.name}
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Company"
                  value={profile.company}
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={profile.phone}
                  margin="normal"
                  disabled
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsProfileDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleShare}>
            <ShareIcon sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={handleDownload}>
            <DownloadIcon sx={{ mr: 1 }} /> Download
          </MenuItem>
          <MenuItem onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          quoteId={selectedQuote?.id || ''}
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Quote</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this quote? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard; 