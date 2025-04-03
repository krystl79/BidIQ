import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Button,
  Container
} from '@mui/material';
import { format } from 'date-fns';

const ProposalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const proposal = location.state?.proposal;

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (!proposal) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Proposal not found
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header with Back Button */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {proposal.projectName || 'Untitled Proposal'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleBack}
            sx={{ ml: 2 }}
          >
            Back
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Solicitation Number
                  </Typography>
                  <Typography variant="body1">
                    {proposal.solicitationNumber || 'Not found'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Number
                  </Typography>
                  <Typography variant="body1">
                    {proposal.projectNumber || 'Not found'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Name
                  </Typography>
                  <Typography variant="body1">
                    {proposal.projectName || 'Not found'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Due Date and Time */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Submission Deadline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(proposal.dueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Time
                  </Typography>
                  <Typography variant="body1">
                    {proposal.dueTime || 'Not found'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Project Description */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {proposal.projectDescription || 'Not found'}
              </Typography>
            </Paper>
          </Grid>

          {/* Project Schedule */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Schedule
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {proposal.projectSchedule || 'Not found'}
              </Typography>
            </Paper>
          </Grid>

          {/* Requirements */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    SOQ Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.soqRequirements || 'Not found'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Content Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {proposal.contentRequirements || 'Not found'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Document Metadata */}
          {proposal.metadata && Object.keys(proposal.metadata).length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Document Metadata
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(proposal.metadata).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Chip
                        label={`${key}: ${value}`}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProposalDetails; 