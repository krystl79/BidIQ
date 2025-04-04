import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Build as BuildIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Estimates',
      description: 'Get accurate equipment recommendations based on project type and requirements.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Save Time',
      description: 'Create professional bids in minutes instead of hours.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Competitive Pricing',
      description: 'Access real-time rental rates from local equipment providers.',
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      title: 'Win More Bids',
      description: 'Stand out with professional, detailed equipment quotes.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Create Accurate Equipment Rental Bids in Minutes with AI
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Save time, win more bids, and get competitive pricing for every project.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/project-input')}
                >
                  Start Estimate
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/features')}
                >
                  Explore Features
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  For Rental Partners
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Get real-time leads from active projects and connect with contractors in your area.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/partner-signup')}
                >
                  Join as Equipment Partner
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Build IQ?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trust Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Trusted by Construction Professionals
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Join over 500+ contractors who use Build IQ to create professional equipment rental bids
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                For General Contractors
              </Typography>
              <Typography variant="body1" paragraph>
                Create accurate equipment rental estimates for your construction projects in minutes.
                Get competitive pricing from local rental companies and win more bids.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                For Subcontractors
              </Typography>
              <Typography variant="body1" paragraph>
                Streamline your equipment rental process with AI-powered recommendations and
                professional bid templates.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Ready to Create Better Equipment Rental Bids?
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, opacity: 0.9 }}>
            Start your first estimate in minutes and see the difference AI can make.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/project-input')}
          >
            Start Your First Estimate
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage; 