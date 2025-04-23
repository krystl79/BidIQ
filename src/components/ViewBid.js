import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBid, getProject, getUserProfile } from '../services/db';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';

const ViewBid = () => {
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [bidData, setBidData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showMarkup, setShowMarkup] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!bidId) {
        setError('No bid ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Load bid data
        const bid = await getBid(bidId.toString());
        if (!bid) {
          setError('Bid not found');
          setIsLoading(false);
          return;
        }

        // Load project data to ensure we have the latest
        const project = await getProject(bid.projectId);
        if (project) {
          bid.projectName = project.projectName;
          bid.projectType = project.projectType;
          bid.location = project.location;
          bid.timeline = project.timeline;
          bid.equipmentMarkup = project.equipmentMarkup;
        }

        setBidData(bid);

        // Load user profile from database
        const profile = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading bid:', error);
        setError('Error loading bid data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [bidId]);

  const handleBack = () => {
    navigate('/bids');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4, px: 2 }}>
        <Paper sx={{ maxWidth: 'lg', mx: 'auto', p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Box>
    );
  }

  if (error || !bidData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4, px: 2 }}>
        <Paper sx={{ maxWidth: 'lg', mx: 'auto', p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Bid Not Found'}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error ? 'An error occurred while loading the bid.' : 'The bid you\'re looking for could not be found.'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back to Bids
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4, px: 2 }}>
      <Paper sx={{ maxWidth: 'lg', mx: 'auto', p: 4 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'flex-start' }, 
          mb: 4,
          gap: { xs: 3, sm: 2 }
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Bid Proposal
            </Typography>
            <Typography color="text.secondary">
              Created: {new Date(bidData.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              fullWidth
              sx={{ 
                height: 48,
                minWidth: { xs: '100%', sm: 140 }
              }}
            >
              Back to Bids
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              fullWidth
              sx={{ 
                height: 48,
                minWidth: { xs: '100%', sm: 140 },
                bgcolor: '#3B82F6', 
                '&:hover': { bgcolor: '#2563EB' }
              }}
            >
              Print / Download PDF
            </Button>
          </Box>
        </Box>

        {/* Equipment Markup Toggle */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showMarkup}
                onChange={(e) => setShowMarkup(e.target.checked)}
                sx={{ color: '#3B82F6', '&.Mui-checked': { color: '#3B82F6' } }}
              />
            }
            label={
              <Typography>
                Apply Equipment Markup ({bidData.equipmentMarkup}%)
              </Typography>
            }
          />
        </Box>

        {/* Proposed By Section */}
        {userProfile && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Proposed By
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="subtitle2">
                  Company
                </Typography>
                <Typography>{userProfile.companyName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="subtitle2">
                  Name
                </Typography>
                <Typography>{userProfile.contactName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="subtitle2">
                  Email
                </Typography>
                <Typography>{userProfile.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary" variant="subtitle2">
                  Phone
                </Typography>
                <Typography>{userProfile.phone}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Project Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Project Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Project Name
              </Typography>
              <Typography>{bidData.projectName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Project Type
              </Typography>
              <Typography>{bidData.projectType}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Location
              </Typography>
              <Typography>
                {bidData.location?.city}, {bidData.location?.state} {bidData.location?.zipCode}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Timeline
              </Typography>
              <Typography>
                {new Date(bidData.timeline?.startDate).toLocaleDateString()} - {new Date(bidData.timeline?.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Client Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Client Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Company
              </Typography>
              <Typography>{bidData.companyName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Contact
              </Typography>
              <Typography>{bidData.contactName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Email
              </Typography>
              <Typography>{bidData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary" variant="subtitle2">
                Phone
              </Typography>
              <Typography>{bidData.phone}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="subtitle2">
                Address
              </Typography>
              <Typography>
                {bidData.address}<br />
                {bidData.city}, {bidData.state} {bidData.zipCode}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Additional Notes */}
        {bidData.notes && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Additional Notes
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {bidData.notes}
            </Typography>
          </Box>
        )}

        {/* Equipment Table */}
        {bidData.equipment && bidData.equipment.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Equipment
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bidData.equipment.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.cost.toFixed(2)}</TableCell>
                      <TableCell align="right">${(item.quantity * item.cost).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      Equipment Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${bidData.equipment.reduce((total, item) => total + (item.quantity * item.cost), 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Add Ons Table */}
        {bidData.additionalItems && bidData.additionalItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add Ons
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Add On</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bidData.additionalItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.cost.toFixed(2)}</TableCell>
                      <TableCell align="right">${(item.quantity * item.cost).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      Add Ons Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${bidData.additionalItems.reduce((total, item) => total + (item.quantity * item.cost), 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Total Cost */}
        <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Equipment Total:</Typography>
                <Typography>
                  ${bidData.equipment?.reduce((total, item) => total + (item.quantity * item.cost), 0).toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Add Ons Total:</Typography>
                <Typography>
                  ${bidData.additionalItems?.reduce((total, item) => total + (item.quantity * item.cost), 0).toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Total Cost:</Typography>
                <Typography variant="h6">
                  ${(
                    (bidData.equipment?.reduce((total, item) => total + (item.quantity * item.cost), 0) || 0) +
                    (bidData.additionalItems?.reduce((total, item) => total + (item.quantity * item.cost), 0) || 0)
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewBid; 