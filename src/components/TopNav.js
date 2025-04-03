import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const TopNav = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/dashboard"
            color={isActive('/dashboard') ? 'primary' : 'inherit'}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/proposals"
            color={isActive('/proposals') ? 'primary' : 'inherit'}
          >
            Proposals
          </Button>
          <Button
            component={Link}
            to="/rfp-responses"
            color={isActive('/rfp-responses') ? 'primary' : 'inherit'}
          >
            RFP Responses
          </Button>
          <Button
            component={Link}
            to="/projects"
            color={isActive('/projects') ? 'primary' : 'inherit'}
          >
            Projects
          </Button>
        </Box>
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav; 