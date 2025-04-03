import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Dashboard, Description, Assignment, Business } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  useAuth();

  return (
    <BottomNavigation
      value={location.pathname}
      showLabels
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: 1,
        borderColor: 'divider',
        display: { md: 'none' },
        zIndex: 1000,
      }}
    >
      <BottomNavigationAction
        label="Dashboard"
        value="/dashboard"
        icon={<Dashboard />}
        component={Link}
        to="/dashboard"
      />
      <BottomNavigationAction
        label="Proposals"
        value="/proposals"
        icon={<Description />}
        component={Link}
        to="/proposals"
      />
      <BottomNavigationAction
        label="RFP Responses"
        value="/rfp-responses"
        icon={<Assignment />}
        component={Link}
        to="/rfp-responses"
      />
      <BottomNavigationAction
        label="Projects"
        value="/projects"
        icon={<Business />}
        component={Link}
        to="/projects"
      />
    </BottomNavigation>
  );
};

export default MobileNav; 