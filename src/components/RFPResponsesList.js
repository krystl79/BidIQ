import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRFPResponses, deleteRFPResponse } from '../services/db';
import { uploadSolicitation } from '../services/solicitationService';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload,
  Search,
  Delete,
  Description
} from '@mui/icons-material';

const RFPProposalsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const allResponses = await getAllRFPResponses();
      setResponses(allResponses);
    } catch (error) {
      console.error('Error loading RFP proposals:', error);
      setError('Error loading proposals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
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

    setUploading(true);
    setError(null);

    try {
      const result = await uploadSolicitation(file, currentUser.uid);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add the new response to the list
      const newResponse = {
        id: result.id,
        title: result.projectData.projectName || 'Untitled Solicitation',
        solicitationNumber: result.projectData.solicitationNumber,
        dueDate: result.projectData.dueDate,
        dueTime: result.projectData.dueTime,
        companyName: '',
        createdAt: new Date().toISOString(),
        status: 'Draft'
      };
      
      setResponses(prevResponses => [newResponse, ...prevResponses]);
      setUploadSuccess(true);
      setFile(null);
      
      // Navigate to the proposal details page
      setTimeout(() => {
        navigate(`/proposals/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message || 'Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (responseId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await deleteRFPResponse(responseId);
        setResponses(responses.filter(response => response.id !== responseId));
      } catch (error) {
        console.error('Error deleting proposal:', error);
        setError('Error deleting proposal. Please try again.');
      }
    }
  };

  const filteredResponses = responses.filter(response =>
    response.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Upload New Solicitation or RFP
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a PDF file to process a new solicitation document
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Select PDF
              </Button>
            </label>
            {file && (
              <Typography variant="body2" color="text.secondary">
                {file.name}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileUpload}
              disabled={!file || uploading}
            >
              {uploading ? <CircularProgress size={24} /> : 'Process'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Proposals
        </Typography>
        <TextField
          fullWidth
          placeholder="Search by title or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredResponses.map((response) => (
          <Grid item xs={12} sm={6} md={4} key={response.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {response.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {response.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(response.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Description />}
                  onClick={() => navigate(`/proposals/${response.id}`)}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(response.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={uploadSuccess}
        autoHideDuration={3000}
        onClose={() => setUploadSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Document processed successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RFPProposalsList; 