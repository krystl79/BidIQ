import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSolicitation } from '../services/solicitationService';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const SolicitationUploadScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Upload the file and create RFP response
      const result = await uploadSolicitation(file, currentUser.uid);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/rfp-responses');
      }, 2000);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Solicitation Document
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
            >
              Select PDF File
            </Button>
          </label>
          {file && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleFileUpload}
          disabled={!file || loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Process Document'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Document processed successfully!
          </Typography>
          <Typography variant="body2">
            Redirecting to proposals list...
          </Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SolicitationUploadScreen; 