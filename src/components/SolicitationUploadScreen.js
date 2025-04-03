import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractProposalInfo } from '../services/pdfService';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import ProposalChecklist from './ProposalChecklist';

const SolicitationUploadScreen = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setExtractedInfo(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const result = await extractProposalInfo(file, currentUser.uid);
      setExtractedInfo(result);
      // Don't navigate away immediately, let user review the extracted information
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Error processing PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (extractedInfo) {
      navigate(`/proposals/${extractedInfo.id}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
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
            <Button variant="contained" component="span">
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

      {extractedInfo && (
        <>
          <ProposalChecklist proposalInfo={extractedInfo} />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinue}
            >
              Continue to Proposal
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default SolicitationUploadScreen; 