import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';
import { Description, Business, Assignment, Add, Person } from '@mui/icons-material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Create Project */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Add sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Create Project
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new project
              </Typography>
              <Button
                component={Link}
                to="/create-project"
                variant="contained"
                color="primary"
              >
                Create
              </Button>
            </Paper>
          </Grid>

          {/* RFPs and Solicitations */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Description sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                RFPs and Solicitations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your RFPs and solicitations
              </Typography>
              <Button
                component={Link}
                to="/rfp-responses"
                variant="contained"
                color="primary"
              >
                View
              </Button>
            </Paper>
          </Grid>

          {/* Projects */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Business sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Projects
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your projects
              </Typography>
              <Button
                component={Link}
                to="/projects"
                variant="contained"
                color="primary"
              >
                View
              </Button>
            </Paper>
          </Grid>

          {/* Bids */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Bids
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your bids
              </Typography>
              <Button
                component={Link}
                to="/bids"
                variant="contained"
                color="primary"
              >
                View
              </Button>
            </Paper>
          </Grid>

          {/* Profile */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and edit your profile
              </Typography>
              <Button
                component={Link}
                to="/profile"
                variant="contained"
                color="primary"
              >
                View
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;