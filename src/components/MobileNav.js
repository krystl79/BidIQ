import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Dashboard as DashboardIcon, Description, Business, Assignment } from '@mui/icons-material';

const MobileNav = () => {
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation>
        <BottomNavigationAction
          component={RouterLink}
          to="/"
          label="Dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/rfp-responses"
          label="RFP Responses"
          icon={<Description />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/projects"
          label="Projects"
          icon={<Business />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/bids"
          label="Bids"
          icon={<Assignment />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNav; 