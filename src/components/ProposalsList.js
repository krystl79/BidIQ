import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container, Typography, Grid, CircularProgress } from '@mui/material';
import ProposalCard from './ProposalCard';

const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProposals = async () => {
      try {
        const proposalsRef = collection(db, 'users', currentUser.uid, 'proposals');
        const q = query(proposalsRef, orderBy('createdAt', 'desc'));
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

    if (currentUser) {
      loadProposals();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
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
          <Typography variant="body1" color="text.secondary">
            No proposals found. Upload a solicitation document to get started.
          </Typography>
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