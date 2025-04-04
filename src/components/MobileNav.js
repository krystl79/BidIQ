import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Dashboard as DashboardIcon, Description, Business, Assignment, Person } from '@mui/icons-material';

const MobileNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
      <BottomNavigation showLabels>
        <BottomNavigationAction
          component={RouterLink}
          to="/dashboard"
          label="Dashboard"
          icon={<DashboardIcon />}
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
        <BottomNavigationAction
          component={RouterLink}
          to="/proposals"
          label="Proposals"
          icon={<Description />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/profile"
          label="Profile"
          icon={<Person />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNav; 