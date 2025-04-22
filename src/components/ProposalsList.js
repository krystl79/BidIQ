import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProposals } from '../services/solicitationService';
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

  useEffect(() => {
    const loadProposals = async () => {
      if (!currentUser) return;
      
      try {
        const userProposals = await getProposals(currentUser.uid);
        setProposals(userProposals);
      } catch (error) {
        console.error('Error loading proposals:', error);
        setError('Failed to load proposals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [currentUser]);

  const handleCreateNew = () => {
    navigate('/create-proposal');
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
          <Typography variant="h4" component="h1">
            My Proposals
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create New Proposal
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
              No proposals yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Click the button above to create your first proposal
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {proposals.map((proposal) => (
              <Grid item xs={12} sm={6} md={4} key={proposal.id}>
                <ProposalCard proposal={proposal} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ProposalsList; 