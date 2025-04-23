import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllBids, deleteBid, getProject } from '../services/db';
import AddItemsToBid from './AddItemsToBid';
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
  Chip
} from '@mui/material';
import {
  Search,
  Delete,
  Add,
  Visibility,
  Description
} from '@mui/icons-material';

const BidsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bids, setBids] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [showAddItems, setShowAddItems] = useState(false);
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBids = await getAllBids();
      
      // Get project details for each bid
      const bidsWithProjects = await Promise.all(
        allBids.map(async (bid) => {
          try {
            const project = await getProject(bid.projectId);
            return {
              ...bid,
              projectName: project?.projectName || 'Unknown Project',
              projectType: project?.projectType || 'Unknown Type',
              timeline: project?.timeline || { startDate: null, endDate: null },
              equipmentMarkup: project?.equipmentMarkup || 0
            };
          } catch (err) {
            console.error('Error loading project for bid:', err);
            return {
              ...bid,
              projectName: 'Unknown Project',
              projectType: 'Unknown Type',
              timeline: { startDate: null, endDate: null },
              equipmentMarkup: 0
            };
          }
        })
      );

      // Sort bids by createdAt in descending order (most recent first)
      const sortedBids = bidsWithProjects.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setBids(sortedBids);
    } catch (err) {
      console.error('Error loading bids:', err);
      setError('Failed to load bids. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBid = (bid) => {
    navigate(`/bids/${bid.id}`);
  };

  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      try {
        await deleteBid(bidId);
        await loadBids();
      } catch (err) {
        console.error('Error deleting bid:', err);
        setError('Failed to delete bid. Please try again later.');
      }
    }
  };

  const handleAddItems = (bid) => {
    setSelectedBidId(bid.id);
    setShowAddItems(true);
  };

  const handleCloseAddItems = () => {
    setShowAddItems(false);
    setSelectedBidId(null);
  };

  const handleSaveItems = async () => {
    await loadBids();
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = 
      bid.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.contactName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = !projectId || bid.projectId === projectId;
    
    return matchesSearch && matchesProject;
  });

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
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
          {projectId ? 'Project Bids' : 'Bids'}
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => navigate('/select-project')}
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
          Create New Bid
        </Button>
      </Box>
        
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Search bids by project or company..."
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

      {filteredBids.length === 0 ? (
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
            {searchQuery ? 'No bids match your search.' : 'No bids found.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredBids.map((bid) => (
            <Grid item xs={12} sm={6} md={4} key={bid.id}>
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
                    {bid.projectName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label={bid.projectType} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mr: 'auto' }}
                    />
                  </Box>
                  {bid.companyName && (
                    <Typography color="text.secondary" gutterBottom>
                      {bid.companyName} {bid.contactName && `- ${bid.contactName}`}
                    </Typography>
                  )}
                  {bid.timeline?.startDate && (
                    <Typography color="text.secondary" gutterBottom>
                      Timeline: {new Date(bid.timeline.startDate).toLocaleDateString()} - {new Date(bid.timeline.endDate).toLocaleDateString()}
                    </Typography>
                  )}
                  <Typography color="text.secondary" gutterBottom>
                    Created: {new Date(bid.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleViewBid(bid)}
                    title="View Bid"
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
                    onClick={() => handleAddItems(bid)}
                    title="Add Items"
                    sx={{ 
                      color: '#4F46E5',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 0.04)',
                      },
                    }}
                  >
                    <Description />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteBid(bid.id)}
                    title="Delete Bid"
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

      {showAddItems && (
        <AddItemsToBid
          bidId={selectedBidId}
          onClose={handleCloseAddItems}
          onSave={handleSaveItems}
        />
      )}
    </Box>
  );
};

export default BidsList; 