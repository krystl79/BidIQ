import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Top navigation bar component for desktop view
const TopNav = () => {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={1}
      sx={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <RouterLink 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit',
            marginRight: '48px'
          }}
        >
          <img 
            src="/logo.png" 
            alt="BidIQ Logo" 
            style={{ 
              height: '40px',
              marginRight: '12px'
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: '#111827'
            }}
          >
            BidIQ
          </Typography>
        </RouterLink>

        <Box sx={{ display: 'flex', gap: 4, flexGrow: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            sx={{
              color: '#4B5563',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#111827',
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/projects"
            sx={{
              color: '#4B5563',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#111827',
              },
            }}
          >
            Projects
          </Button>
          <Button
            component={RouterLink}
            to="/bids"
            sx={{
              color: '#4B5563',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#111827',
              },
            }}
          >
            Bids
          </Button>
          <Button
            component={RouterLink}
            to="/profile"
            sx={{
              color: '#4B5563',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#111827',
              },
            }}
          >
            Profile
          </Button>
        </Box>

        <Button
          onClick={handleSignOut}
          sx={{
            color: '#4B5563',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#111827',
            },
          }}
        >
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav; 