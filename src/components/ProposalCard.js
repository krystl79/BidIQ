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
  CircularProgress,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  Delete, 
  Upload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  PlayArrow as ProcessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { deleteProposal, addAttachmentToProposal, removeAttachmentFromProposal, saveProposal, generateProposalResponse } from '../services/db';
import { useNavigate } from 'react-router-dom';

const ProposalCard = ({ proposal: initialProposal, onDelete }) => {
  const [proposal, setProposal] = useState(initialProposal);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [deleteAttachmentDialogOpen, setDeleteAttachmentDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [promptResponses, setPromptResponses] = useState({});
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    notes: ''
  });
  const fileInputRef = useRef(null);

  // Initialize edit form data when edit dialog opens
  React.useEffect(() => {
    if (editOpen) {
      setEditFormData({
        title: proposal.title || '',
        description: proposal.description || '',
        dueDate: proposal.dueDate || '',
        notes: proposal.notes || ''
      });
    }
  }, [editOpen, proposal]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleDeleteClick = () => setDeleteDialogOpen(true);
  const handleDeleteCancel = () => setDeleteDialogOpen(false);

  const handleProcessClick = () => {
    setProcessDialogOpen(true);
    setActiveStep(0);
    setPromptResponses({});
    setCurrentPrompt('');
    setGeneratedDocument('');
    processDocument(); // Start processing when dialog opens
  };

  const handleProcessClose = () => {
    setProcessDialogOpen(false);
    setActiveStep(0);
    setPromptResponses({});
    setCurrentPrompt('');
    setGeneratedDocument('');
  };

  const handleNext = () => {
    const allPrompts = promptResponses._allPrompts || [];
    
    if (activeStep < allPrompts.length - 1) {
      // Move to next prompt
      setActiveStep(activeStep + 1);
    } else {
      // Generate document when all prompts are answered
      const document = generateDocument(promptResponses);
      setGeneratedDocument(document);
      setActiveStep(allPrompts.length); // Move to the final step
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      // Move to previous prompt
      setActiveStep(activeStep - 1);
    }
  };

  const handlePromptResponse = (response) => {
    const currentPrompt = promptResponses._allPrompts?.[activeStep];
    if (currentPrompt) {
      setPromptResponses(prev => ({
        ...prev,
        [currentPrompt]: response
      }));
    }
  };

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

    // Check if there's already a non-response attachment
    const nonResponseAttachments = proposal.attachments?.filter(attachment => !attachment.name.startsWith('response_')) || [];
    if (nonResponseAttachments.length > 0) {
      setSnackbar({
        open: true,
        message: 'Only one attachment is allowed per proposal. Please remove the existing attachment first.',
        severity: 'warning'
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);

    try {
      const updatedProposal = await addAttachmentToProposal(proposal.id, file);
      setProposal(updatedProposal);
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload file. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    const attachment = proposal.attachments.find(a => a.id === attachmentId);
    setAttachmentToDelete(attachment);
    setDeleteAttachmentDialogOpen(true);
  };

  const handleDeleteAttachmentConfirm = async () => {
    try {
      const updatedProposal = await removeAttachmentFromProposal(proposal.id, attachmentToDelete.id);
      setProposal(updatedProposal);
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
      setDeleteAttachmentDialogOpen(false);
      setAttachmentToDelete(null);
    } catch (error) {
      console.error('Error removing attachment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove attachment',
        severity: 'error'
      });
    }
  };

  const handleDeleteAttachmentCancel = () => {
    setDeleteAttachmentDialogOpen(false);
    setAttachmentToDelete(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = async () => {
    try {
      const updatedProposal = {
        ...proposal,
        ...editFormData,
        updatedAt: new Date().toISOString()
      };
      await saveProposal(updatedProposal);
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
      handleEditClose();
    } catch (error) {
      console.error('Error saving proposal:', error);
      setError('Failed to save changes. Please try again.');
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

  const processDocument = async () => {
    if (!proposal.attachments?.length) {
      setSnackbar({
        open: true,
        message: 'No attachments found to process',
        severity: 'error'
      });
      return;
    }

    setProcessing(true);
    try {
      // Example prompts - in a real implementation, these would be generated based on the document content
      const prompts = [
        'What is the project scope?',
        'What are the key deliverables?',
        'What is the timeline for completion?',
        'What are the technical requirements?',
        'What is the budget range?',
        'What are the evaluation criteria?'
      ];

      // Initialize prompt responses with empty values
      const initialResponses = {};
      prompts.forEach(prompt => {
        initialResponses[prompt] = '';
      });

      // Store all prompts and initialize responses
      setPromptResponses({
        ...initialResponses,
        _allPrompts: prompts
      });
      
      // Reset to first step
      setActiveStep(0);
    } catch (error) {
      console.error('Error processing document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process document. Please try again.',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const generateDocument = (responses) => {
    // Create a structured document based on all prompt responses
    const title = proposal.title || 'Untitled Proposal';
    const description = proposal.description || 'No description provided';
    const dueDate = proposal.dueDate ? formatDate(proposal.dueDate) : 'Not specified';
    
    // Start with a header section
    let document = `# Response to ${title}\n\n`;
    document += `## Project Overview\n${description}\n\n`;
    document += `## Due Date\n${dueDate}\n\n`;
    document += `## Response Details\n\n`;
    
    // Add each prompt and response
    const allPrompts = responses._allPrompts || [];
    allPrompts.forEach(prompt => {
      const response = responses[prompt] || 'No response provided';
      document += `### ${prompt}\n${response}\n\n`;
    });
    
    // Add a conclusion section
    document += `## Conclusion\n`;
    document += `This response document was generated based on the analysis of the proposal and the provided responses to the prompts.\n\n`;
    document += `Generated on: ${new Date().toLocaleDateString()}\n`;
    
    return document;
  };

  const handleGenerateDocument = async () => {
    try {
      setGenerating(true);
      
      // Generate a document based on all prompt responses
      const responseText = generateDocument(promptResponses);
      console.log('Generated response document:', responseText);
      
      // Create a Blob from the response text
      const responseBlob = new Blob([responseText], { type: 'text/plain' });
      
      // Create a File object from the Blob
      const responseFile = new File([responseBlob], `response_${proposal.id}.txt`, { type: 'text/plain' });
      
      // Add the file as an attachment to the proposal
      const updatedProposal = await addAttachmentToProposal(proposal.id, responseFile);
      console.log('Updated proposal with response attachment:', updatedProposal);
      
      // Update the local state
      setProposal(updatedProposal);
      
      // Update the parent component
      if (onDelete) {
        onDelete(proposal.id, true, updatedProposal);
      }
      
      setGenerating(false);
      setSnackbar({
        open: true,
        message: 'Response document generated and attached successfully',
        severity: 'success'
      });
      
      // Close the process dialog
      handleProcessClose();
    } catch (error) {
      console.error('Error generating document:', error);
      setGenerating(false);
      setSnackbar({
        open: true,
        message: 'Failed to generate response document',
        severity: 'error'
      });
    }
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
          <Tooltip title="Edit Proposal">
            <IconButton 
              size="small" 
              onClick={handleEditOpen}
              sx={{ 
                color: '#4F46E5',
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Process Document">
            <IconButton 
              size="small" 
              onClick={handleProcessClick}
              disabled={!proposal.attachments?.length}
              sx={{ 
                color: '#4F46E5',
                '&:hover': {
                  backgroundColor: 'rgba(79, 70, 229, 0.04)',
                },
              }}
            >
              <ProcessIcon />
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

      {/* View Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Proposal Details
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
                      {proposal.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {proposal.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Response Documents */}
            {proposal.attachments?.filter(attachment => attachment.name.startsWith('response_')).length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Response
                  </Typography>
                  <List>
                    {proposal.attachments
                      .filter(attachment => attachment.name.startsWith('response_'))
                      .map((attachment) => (
                        <ListItem
                          key={attachment.id}
                          button
                          onClick={() => downloadAttachment(attachment)}
                        >
                          <FileIcon sx={{ mr: 2 }} />
                          <ListItemText
                            primary={attachment.name.replace('response_', 'Response Document')}
                            secondary={`${formatFileSize(attachment.size)} • Uploaded ${formatDate(attachment.uploadedAt)}`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              </Grid>
            )}

            {/* Attachments */}
            {proposal.attachments?.filter(attachment => !attachment.name.startsWith('response_')).length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Attachments
                  </Typography>
                  <List>
                    {proposal.attachments
                      .filter(attachment => !attachment.name.startsWith('response_'))
                      .map((attachment) => (
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

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Proposal
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
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      multiline
                      rows={4}
                    />
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
                    <TextField
                      fullWidth
                      label="Due Date"
                      name="dueDate"
                      type="date"
                      value={editFormData.dueDate}
                      onChange={handleEditChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditChange}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Response Documents */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Response
                </Typography>
                <List>
                  {proposal.attachments?.filter(attachment => attachment.name.startsWith('response_')).map((attachment) => (
                    <ListItem
                      key={attachment.id}
                      button
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <FileIcon sx={{ mr: 2 }} />
                      <ListItemText
                        primary={attachment.name.replace('response_', 'Response Document')}
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
                  {(!proposal.attachments || proposal.attachments.filter(attachment => attachment.name.startsWith('response_')).length === 0) && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No response documents
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Attachments */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Attachments
                  </Typography>
                  <Button
                    startIcon={<UploadIcon />}
                    onClick={handleUploadClick}
                    disabled={uploading || proposal.attachments?.filter(attachment => !attachment.name.startsWith('response_')).length > 0}
                  >
                    {uploading ? 'Uploading...' : proposal.attachments?.filter(attachment => !attachment.name.startsWith('response_')).length > 0 ? 'Remove existing attachment first' : 'Upload File'}
                  </Button>
                </Box>
                <List>
                  {proposal.attachments?.filter(attachment => !attachment.name.startsWith('response_')).map((attachment) => (
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
                  {(!proposal.attachments || proposal.attachments.filter(attachment => !attachment.name.startsWith('response_')).length === 0) && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No attachments
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={handleProcessClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Process Document
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="vertical">
            {promptResponses._allPrompts?.map((prompt, index) => (
              <Step key={index}>
                <StepLabel>Prompt {index + 1}</StepLabel>
                <StepContent>
                  {processing ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                      <CircularProgress size={24} />
                      <Typography>Processing document...</Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        {prompt || 'No prompt available'}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={promptResponses[prompt] || ''}
                        onChange={(e) => handlePromptResponse(e.target.value)}
                        placeholder="Enter your response here..."
                        sx={{ mt: 2 }}
                      />
                      <Box sx={{ mb: 2, mt: 2 }}>
                        <div>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            {index === (promptResponses._allPrompts?.length || 0) - 1 ? 'Finish' : 'Continue'}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Back
                          </Button>
                        </div>
                      </Box>
                    </>
                  )}
                </StepContent>
              </Step>
            ))}
            <Step>
              <StepLabel>Generated Document</StepLabel>
              <StepContent>
                <Typography variant="subtitle1" gutterBottom>
                  Your document has been generated based on all your responses to the prompts.
                </Typography>
                <Paper sx={{ p: 2, my: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {generatedDocument}
                  </Typography>
                </Paper>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateDocument}
                    disabled={generating}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {generating ? 'Generating...' : 'Generate & Attach Response Document'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProcessClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Attachment Confirmation Dialog */}
      <Dialog
        open={deleteAttachmentDialogOpen}
        onClose={handleDeleteAttachmentCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete {attachmentToDelete?.name.startsWith('response_') ? 'Response' : 'Attachment'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {attachmentToDelete?.name.startsWith('response_') ? 'response' : 'attachment'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteAttachmentCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteAttachmentConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProposalCard; 