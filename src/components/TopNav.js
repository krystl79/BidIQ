import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';

// Top navigation bar component for desktop view
const TopNav = () => {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Projects', path: '/projects' },
    { text: 'Bids', path: '/bids' },
    { text: 'Proposals', path: '/rfp-responses' },
    { text: 'Profile', path: '/profile' }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <RouterLink 
        to="/dashboard" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          color: 'inherit',
          padding: '16px',
          justifyContent: 'center'
        }}
      >
        <img 
          src="/logo.png" 
          alt="BidIQ Logo" 
          style={{ 
            height: '32px',
            marginRight: '8px'
          }} 
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827' }}>
          BidIQ
        </Typography>
      </RouterLink>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Button
              component={RouterLink}
              to={item.path}
              sx={{
                width: '100%',
                color: '#4B5563',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                py: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: '#111827',
                },
              }}
            >
              <ListItemText primary={item.text} />
            </Button>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <Button
            onClick={handleSignOut}
            sx={{
              width: '100%',
              color: '#4B5563',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              py: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: '#111827',
              },
            }}
          >
            <ListItemText primary="Sign Out" />
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={1}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Toolbar sx={{ minHeight: '64px' }}>
          <RouterLink 
            to="/dashboard" 
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

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 4, flexGrow: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
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
                    {item.text}
                  </Button>
                ))}
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
            </>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Add spacing below fixed AppBar */}
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            backgroundColor: 'white'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default TopNav; 