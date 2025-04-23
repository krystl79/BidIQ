import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveProposal } from '../services/db';
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
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate user is logged in
    if (!currentUser) {
      setError('You must be logged in to create a proposal');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const proposalData = {
        id: Date.now().toString(),
        ...formData,
        userId: currentUser.id,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.email,
        lastModifiedBy: currentUser.email,
      };

      console.log('Saving proposal:', proposalData);
      await saveProposal(proposalData);
      navigate('/proposals');
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again.');
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