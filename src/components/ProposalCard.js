import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Grid,
  Paper
} from '@mui/material';
import { format } from 'date-fns';

const ProposalCard = ({ proposal }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleViewDetails = () => {
    navigate(`/proposals/${proposal.id}/details`, { state: { proposal } });
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

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2, transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {proposal.projectName || 'Untitled Proposal'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {proposal.solicitationNumber && (
              <Chip 
                label={`Solicitation: ${proposal.solicitationNumber}`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
            {proposal.projectNumber && (
              <Chip 
                label={`Project: ${proposal.projectNumber}`} 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
            )}
            {proposal.dueDate && (
              <Chip 
                label={`Due: ${formatDate(proposal.dueDate)}`} 
                size="small" 
                color={new Date(proposal.dueDate) < new Date() ? "error" : "success"} 
                variant="outlined" 
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical' 
          }}>
            {proposal.projectDescription || 'No description available'}
          </Typography>
        </CardContent>
        
        <CardActions>
          <Button size="small" onClick={handleOpen}>View Summary</Button>
          <Button size="small" color="primary" onClick={handleViewDetails}>View Details</Button>
        </CardActions>
      </Card>

      {/* Summary Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Proposal Summary
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
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
              <Paper sx={{ p: 2 }}>
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
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Project Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {proposal.projectDescription || 'Not found'}
                </Typography>
              </Paper>
            </Grid>

            {/* Document Metadata */}
            {proposal.metadata && Object.keys(proposal.metadata).length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleViewDetails} color="primary">
            View Full Details
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposalCard; 