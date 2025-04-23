import React, { useState, useRef } from 'react';
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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  Delete, 
  Upload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { deleteProposal, addAttachmentToProposal, removeAttachmentFromProposal } from '../services/db';

const ProposalCard = ({ proposal, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  const handleDelete = async () => {
    try {
      await deleteProposal(proposal.id);
      if (onDelete) {
        onDelete(proposal.id);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const updatedProposal = await addAttachmentToProposal(proposal.id, file);
      // Update the proposal in place instead of forcing a full refresh
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const updatedProposal = await removeAttachmentFromProposal(proposal.id, attachmentId);
      // Update the proposal in place instead of forcing a full refresh
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
    } catch (error) {
      console.error('Error removing attachment:', error);
      setError('Failed to remove attachment. Please try again.');
    }
  };

  const downloadAttachment = (attachment) => {
    const blob = new Blob([attachment.data], { type: attachment.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            {proposal.attachments?.length > 0 && (
              <Chip 
                label={`${proposal.attachments.length} attachment${proposal.attachments.length === 1 ? '' : 's'}`}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx"
          />
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
          <Tooltip title="Upload Document">
            <IconButton 
              size="small" 
              onClick={handleUploadClick}
              disabled={uploading}
              sx={{ 
                color: '#4F46E5',
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                },
              }}
            >
              {uploading ? <CircularProgress size={24} /> : <UploadIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Proposal">
            <IconButton 
              size="small" 
              onClick={handleDeleteClick}
              sx={{ 
                color: '#EF4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Proposal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this proposal? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

            {/* Attachments */}
            {proposal.attachments?.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  <List>
                    {proposal.attachments.map((attachment) => (
                      <ListItem
                        key={attachment.id}
                        button
                        onClick={() => downloadAttachment(attachment)}
                      >
                        <FileIcon sx={{ mr: 2 }} />
                        <ListItemText
                          primary={attachment.name}
                          secondary={`${formatFileSize(attachment.size)} • Uploaded ${formatDate(attachment.uploadedAt)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAttachment(attachment.id);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
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