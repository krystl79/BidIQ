import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProposalsByUser, getAllProposals } from '../services/db';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProposalCard from './ProposalCard';

const ProposalsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProposals = useCallback(async () => {
    console.log('ProposalsList - loadProposals called');
    if (!currentUser) {
      console.log('ProposalsList - No current user found');
      return;
    }
    
    console.log('ProposalsList - Current user:', currentUser);
    setLoading(true);
    
    try {
      // First try to get all proposals to check if the store is working
      console.log('ProposalsList - Getting all proposals first');
      const allProposals = await getAllProposals();
      console.log('ProposalsList - All proposals:', allProposals);

      // Then get user-specific proposals
      console.log('ProposalsList - Getting user proposals');
      const userProposals = await getProposalsByUser(currentUser.id);
      console.log('ProposalsList - User proposals:', userProposals);
      
      setProposals(userProposals);
    } catch (error) {
      console.error('ProposalsList - Error loading proposals:', error);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load proposals on mount
  useEffect(() => {
    console.log('ProposalsList - Component mounted');
    loadProposals();
  }, [loadProposals]);

  // Reload proposals when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('ProposalsList - Window focused');
      loadProposals();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProposals]);

  // Force reload proposals every 5 seconds while component is mounted
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('ProposalsList - Forced reload');
      loadProposals();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadProposals]);

  const handleCreateNew = () => {
    navigate('/create-proposal');
  };

  const handleDelete = (proposalId, isUpdate = false, updatedProposal = null) => {
    console.log('ProposalsList - handleDelete called:', { proposalId, isUpdate, updatedProposal });
    if (isUpdate && updatedProposal) {
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === proposalId ? updatedProposal : proposal
        )
      );
    } else {
      setProposals(prevProposals => 
        prevProposals.filter(proposal => proposal.id !== proposalId)
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 400,
              color: '#111827'
            }}
          >
            Proposals
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNew}
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
            Create Proposal
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {proposals.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No proposals found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {proposals.map((proposal) => (
              <Grid item xs={12} sm={6} md={4} key={proposal.id}>
                <ProposalCard 
                  proposal={proposal} 
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ProposalsList; 