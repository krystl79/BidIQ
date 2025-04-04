import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';

interface BidData {
  projectName: string;
  location: string;
  type: string;
  size: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string;
  equipment: Array<{
    id: string;
    name: string;
    quantity: number;
    duration: 'daily' | 'weekly' | 'monthly';
    rate: number;
  }>;
  markup: number;
  terms: string;
  includeLogo: boolean;
  shareWithPartners: boolean;
}

const BidReview: React.FC = () => {
  const navigate = useNavigate();
  const [bidData, setBidData] = useState<BidData>({
    projectName: 'Sample Project',
    location: 'Orlando, FL',
    type: 'Commercial Construction',
    size: '50,000 sq ft',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: 'Standard commercial construction project requiring various equipment.',
    equipment: [
      {
        id: 'excavator-50k',
        name: 'Excavator - 50,000 lbs',
        quantity: 2,
        duration: 'weekly',
        rate: 2500,
      },
      {
        id: 'boom-lift-60',
        name: 'Boom Lift - 60ft',
        quantity: 1,
        duration: 'weekly',
        rate: 900,
      },
    ],
    markup: 15,
    terms: 'Standard rental terms and conditions apply. Equipment delivery and pickup included within service area.',
    includeLogo: true,
    shareWithPartners: true,
  });

  const calculateSubtotal = () => {
    return bidData.equipment.reduce((total: number, item: { rate: number; quantity: number }) => {
      return total + item.rate * item.quantity;
    }, 0);
  };

  const calculateMarkup = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * bidData.markup) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateMarkup();
  };

  const handleMarkupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidData({
      ...bidData,
      markup: Number(event.target.value),
    });
  };

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidData({
      ...bidData,
      terms: event.target.value,
    });
  };

  const handleShareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidData({
      ...bidData,
      shareWithPartners: event.target.checked,
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidData({
      ...bidData,
      includeLogo: event.target.checked,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={2} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Project Information</StepLabel>
          </Step>
          <Step>
            <StepLabel>Equipment Selection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review & Generate Bid</StepLabel>
          </Step>
        </Stepper>

        <Typography variant="h4" gutterBottom>
          Review & Generate Bid
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Review your bid details and customize the final document before generating.
        </Typography>

        <Grid container spacing={4}>
          {/* Project Information */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Name
                </Typography>
                <Typography variant="body1">{bidData.projectName}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">{bidData.location}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Type
                </Typography>
                <Typography variant="body1">{bidData.type}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Size
                </Typography>
                <Typography variant="body1">{bidData.size}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {bidData.startDate?.toLocaleDateString()} - {bidData.endDate?.toLocaleDateString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Equipment List */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Equipment List
              </Typography>
              {bidData.equipment.map((item: { id: string; name: string; quantity: number; rate: number; duration: string }) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {item.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.rate.toLocaleString()} per {item.duration}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="h6">${calculateSubtotal().toLocaleString()}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Markup ({bidData.markup}%)
                </Typography>
                <Typography variant="h6">${calculateMarkup().toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5">${calculateTotal().toLocaleString()}</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Customization Options */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customize Your Bid
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Markup Percentage"
                    type="number"
                    value={bidData.markup}
                    onChange={handleMarkupChange}
                    InputProps={{
                      inputProps: { min: 0, max: 100 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Terms & Conditions"
                    value={bidData.terms}
                    onChange={handleTermsChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bidData.includeLogo}
                        onChange={handleLogoChange}
                      />
                    }
                    label="Include Company Logo"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bidData.shareWithPartners}
                        onChange={handleShareChange}
                      />
                    }
                    label="Share with Rental Partners for Better Pricing"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DuplicateIcon />}
                onClick={() => navigate('/project-input')}
                size="large"
              >
                Duplicate
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => navigate('/dashboard')}
                size="large"
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                startIcon={<PdfIcon />}
                size="large"
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                size="large"
              >
                Email to Client
              </Button>
            </Box>
          </Grid>
        </Grid>

        {bidData.shareWithPartners && (
          <Alert severity="info" sx={{ mt: 4 }}>
            Your project information will be shared with rental partners in your area to provide competitive pricing offers.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default BidReview; 