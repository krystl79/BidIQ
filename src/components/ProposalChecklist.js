import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Divider } from '@mui/material';
import { format } from 'date-fns';

const ProposalChecklist = ({ proposalInfo }) => {
  if (!proposalInfo) return null;

  const {
    dueDate,
    dueTime,
    solicitationNumber,
    projectNumber,
    projectName,
    projectDescription,
    projectSchedule,
    soqRequirements,
    contentRequirements,
    metadata,
    pagesText
  } = proposalInfo;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Proposal Checklist
      </Typography>

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
                  {solicitationNumber || 'Not found'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Number
                </Typography>
                <Typography variant="body1">
                  {projectNumber || 'Not found'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Name
                </Typography>
                <Typography variant="body1">
                  {projectName || 'Not found'}
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
                  {dueDate ? format(new Date(dueDate), 'MMMM d, yyyy') : 'Not found'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Due Time
                </Typography>
                <Typography variant="body1">
                  {dueTime || 'Not found'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Project Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {projectDescription || 'Not found'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Schedule
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {projectSchedule || 'Not found'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Requirements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  SOQ Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {soqRequirements || 'Not found'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Content Requirements
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {contentRequirements || 'Not found'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Document Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Document Metadata
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(metadata).map(([key, value]) => (
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
  );
};

export default ProposalChecklist; 