import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractProposalInfo } from '../services/docupandaService';
import { analyzeDocument, generateBidScore, generateRiskAssessment } from '../services/nlpService';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';

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
      navigate(`/proposals/${result.id}`);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Error processing PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Solicitation
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select PDF File
          </Typography>
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="pdf-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="pdf-file">
            <Button variant="contained" component="span">
              Choose PDF
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </label>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {extractedInfo && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Extracted Information
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Typography><strong>Due Date:</strong> {extractedInfo.dueDate || 'Not found'}</Typography>
              <Typography><strong>Due Time:</strong> {extractedInfo.dueTime || 'Not found'}</Typography>
              <Typography><strong>Solicitation Number:</strong> {extractedInfo.solicitationNumber || 'Not found'}</Typography>
              <Typography><strong>Project Number:</strong> {extractedInfo.projectNumber || 'Not found'}</Typography>
              <Typography><strong>Project Name:</strong> {extractedInfo.projectName || 'Not found'}</Typography>
              <Typography><strong>Project Description:</strong> {extractedInfo.projectDescription || 'Not found'}</Typography>
              <Typography><strong>Project Schedule:</strong> {extractedInfo.projectSchedule || 'Not found'}</Typography>
              <Typography><strong>SOQ Requirements:</strong> {extractedInfo.soqRequirements || 'Not found'}</Typography>
              <Typography><strong>Content Requirements:</strong> {extractedInfo.contentRequirements || 'Not found'}</Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
            disabled={!file || loading}
          >
            Process PDF
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SolicitationUploadScreen; 