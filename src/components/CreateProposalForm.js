import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveProposal, getProposal } from '../services/db';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

const CreateProposalForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CreateProposalForm] Starting form submission');
    
    if (!currentUser) {
      console.error('[CreateProposalForm] No current user found');
      setError('You must be logged in to create a proposal');
      return;
    }

    console.log('[CreateProposalForm] Current user:', currentUser);

    const proposalData = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      notes: formData.notes,
      userId: currentUser.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: []
    };

    console.log('[CreateProposalForm] Proposal data to save:', proposalData);
    
    try {
      setLoading(true);
      console.log('[CreateProposalForm] Calling saveProposal');
      const savedProposal = await saveProposal(proposalData);
      console.log('[CreateProposalForm] Proposal saved successfully:', savedProposal);
      
      // Verify the save by retrieving the proposal
      console.log('[CreateProposalForm] Verifying save by retrieving proposal');
      const retrievedProposal = await getProposal(savedProposal.id);
      console.log('[CreateProposalForm] Retrieved proposal:', retrievedProposal);
      
      if (!retrievedProposal) {
        console.error('[CreateProposalForm] Failed to verify saved proposal - proposal not found');
        setError('Failed to save proposal - please try again');
        return;
      }
      
      console.log('[CreateProposalForm] Navigation to proposals list');
      navigate('/proposals');
    } catch (error) {
      console.error('[CreateProposalForm] Error saving proposal:', error);
      setError('Failed to save proposal - please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/proposals');
  };

  return (
    <Box sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      p: 4,
      pb: { xs: 10, sm: 4 },
      bgcolor: '#fff' 
    }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Create New Proposal
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Typography sx={{ mb: 1 }}>
          Title <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          name="title"
          placeholder="Enter proposal title"
          value={formData.title}
          onChange={handleChange}
          required
          sx={{ mb: 4 }}
        />

        <Typography sx={{ mb: 1 }}>
          Description <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          name="description"
          placeholder="Enter proposal description"
          value={formData.description}
          onChange={handleChange}
          required
          multiline
          rows={6}
          sx={{ mb: 4 }}
        />

        <Typography sx={{ mb: 1 }}>
          Due Date <span style={{ color: '#DC2626' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          InputProps={{
            inputProps: { placeholder: 'mm/dd/yyyy' }
          }}
          sx={{ mb: 4 }}
        />

        <Typography sx={{ mb: 1 }}>
          Additional Notes
        </Typography>
        <TextField
          fullWidth
          name="notes"
          placeholder="Enter any additional notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={4}
          sx={{ mb: 4 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Proposal'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateProposalForm; 