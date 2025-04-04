import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllBids, deleteBid, getProject } from '../services/db';
import AddItemsToBid from './AddItemsToBid';
import { Container, Box, Typography, Button, TextField, CircularProgress, Alert } from '@mui/material';

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
        await loadBids(); // Refresh the bids list
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
    await loadBids(); // Refresh the bids list
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
        <Typography variant="h4" component="h1" gutterBottom>
          {projectId ? 'Project Bids' : 'All Bids'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search bids by project or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/select-project')}
          >
            Create New Bid
          </Button>
        </Box>

        {filteredBids.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {searchQuery ? 'No bids match your search.' : 'No bids found.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {filteredBids.map((bid) => (
              <Box
                key={bid.id}
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {bid.projectName}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {bid.projectType}
                </Typography>
                {bid.companyName && (
                  <Typography color="text.secondary" gutterBottom>
                    {bid.companyName} {bid.contactName && `- ${bid.contactName}`}
                  </Typography>
                )}
                {bid.timeline.startDate && (
                  <Typography color="text.secondary" gutterBottom>
                    {new Date(bid.timeline.startDate).toLocaleDateString()} - {new Date(bid.timeline.endDate).toLocaleDateString()}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {new Date(bid.createdAt).toLocaleDateString()}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleViewBid(bid)}
                  >
                    View Bid
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAddItems(bid)}
                  >
                    Add Ons
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteBid(bid.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {showAddItems && selectedBidId && (
        <AddItemsToBid
          bidId={selectedBidId}
          onClose={handleCloseAddItems}
          onSave={handleSaveItems}
        />
      )}
    </Container>
  );
};

export default BidsList; 