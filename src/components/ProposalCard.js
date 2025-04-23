import React, { useState } from 'react';
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
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { format } from 'date-fns';

const ProposalCard = ({ proposal }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      <Card sx={{ 
        mb: 2, 
        boxShadow: 2, 
        transition: '0.3s', 
        '&:hover': { 
          boxShadow: 4,
          bgcolor: 'rgba(0, 0, 0, 0.01)'
        } 
      }}>
        <CardContent>
          <Typography 
            variant="h6" 
            component="div" 
            gutterBottom
            sx={{ 
              color: '#111827',
              fontWeight: 600
            }}
          >
            {proposal.title || 'Untitled Proposal'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              label={`Due: ${formatDate(proposal.dueDate)}`} 
              size="small" 
              color={new Date(proposal.dueDate) < new Date() ? "error" : "success"} 
              variant="outlined" 
            />
            <Chip 
              label={`Status: ${proposal.status}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical',
              mb: 2,
              lineHeight: 1.5
            }}
          >
            {proposal.description || 'No description available'}
          </Typography>

          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block'
            }}
          >
            Created: {formatDate(proposal.createdAt)}
          </Typography>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={handleOpen}
              sx={{ 
                color: '#4F46E5',
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                },
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
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
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Title
                    </Typography>
                    <Typography variant="body1">
                      {proposal.title || 'Not found'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {proposal.description || 'Not found'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Due Date and Notes */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Details
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
                      Status
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {proposal.status || 'Not found'}
                    </Typography>
                  </Grid>
                  {proposal.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Additional Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {proposal.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Metadata
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {proposal.createdBy || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(proposal.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Modified By
                    </Typography>
                    <Typography variant="body1">
                      {proposal.lastModifiedBy || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Modified At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(proposal.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProposalCard; 