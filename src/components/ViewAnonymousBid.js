import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Paper, Typography, Box, Divider } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import BidTemplate from './BidTemplate';
import html2pdf from 'html2pdf.js';

const ViewAnonymousBid = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, bid, isAnonymous } = location.state || {};

  if (!project || !bid || !isAnonymous) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Invalid bid data. Please start over with the chatbot.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/chat')}
          sx={{ mt: 2 }}
        >
          Start New Project
        </Button>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('bid-content');
    const opt = {
      margin: 1,
      filename: `${project.projectName}-bid.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Bid Proposal
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <div id="bid-content">
          <BidTemplate
            project={project}
            bid={bid}
            isAnonymous={true}
          />
        </div>
        <Box mt={3} textAlign="center">
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Want to save this project and bid?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login?mode=signup')}
          >
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ViewAnonymousBid; 