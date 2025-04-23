import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProposalsByUser } from '../services/db';
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
    if (!currentUser) return;
    
    try {
      const userProposals = await getProposalsByUser(currentUser.id);
      setProposals(userProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    const handleFocus = () => {
      loadProposals();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProposals]);

  const handleCreateNew = () => {
    navigate('/create-proposal');
  };

  const handleDelete = (proposalId, isUpdate = false, updatedProposal = null) => {
    if (isUpdate && updatedProposal) {
      // Update the proposal in place
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === proposalId ? updatedProposal : proposal
        )
      );
    } else {
      // Remove the proposal
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