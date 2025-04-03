import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Dashboard as DashboardIcon, Description, Business, Assignment, Person } from '@mui/icons-material';

// Top navigation bar component for desktop view
const TopNav = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          BidIQ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/rfp-responses"
            color="inherit"
            startIcon={<Description />}
          >
            RFPs and Solicitations
          </Button>
          <Button
            component={RouterLink}
            to="/projects"
            color="inherit"
            startIcon={<Business />}
          >
            Projects
          </Button>
          <Button
            component={RouterLink}
            to="/bids"
            color="inherit"
            startIcon={<Assignment />}
          >
            Bids
          </Button>
          <Button
            component={RouterLink}
            to="/profile"
            color="inherit"
            startIcon={<Person />}
          >
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav; 