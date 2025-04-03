import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import { Add, Description, Business, CheckCircle, Person } from '@mui/icons-material';

const DashboardCard = ({ to, icon: Icon, title }) => (
  <Link 
    to={to}
    style={{ 
      textDecoration: 'none',
      color: 'inherit'
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Icon 
        sx={{ 
          fontSize: 48, 
          color: '#4F46E5',
          marginBottom: 2
        }} 
      />
      <Typography
        variant="h6"
        sx={{
          color: '#111827',
          fontSize: '1.25rem',
          fontWeight: 500,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
    </Box>
  </Link>
);

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px'
          }}
        >
          Welcome to BidIQ
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#6B7280',
            fontWeight: 'normal'
          }}
        >
          Your AI-powered bid assistant
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 3,
          mt: 4,
        }}
      >
        <DashboardCard
          to="/create-project"
          icon={Add}
          title="Create Project"
        />
        <DashboardCard
          to="/projects"
          icon={Business}
          title="Projects"
        />
        <DashboardCard
          to="/bids"
          icon={CheckCircle}
          title="Bids"
        />
        <DashboardCard
          to="/proposals"
          icon={Description}
          title="Proposals"
        />
        <DashboardCard
          to="/profile"
          icon={Person}
          title="Profile"
        />
      </Box>
    </Container>
  );
};

export default Dashboard;