import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container, Typography, Grid, CircularProgress, Alert, Button } from '@mui/material';
import ProposalCard from './ProposalCard';

const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProposals = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const proposalsRef = collection(db, 'proposals');
        const q = query(
          proposalsRef,
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const loadedProposals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProposals(loadedProposals);
      } catch (error) {
        console.error('Error loading proposals:', error);
        setError('Error loading proposals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading proposals...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Proposals
        </Typography>

        {proposals.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body1">
              No proposals found. Upload a solicitation document to get started.
            </Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {proposals.map((proposal) => (
              <Grid item xs={12} key={proposal.id}>
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