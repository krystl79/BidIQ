import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, saveUserProfile } from '../services/db';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  MenuItem,
  Divider,
  Snackbar
} from '@mui/material';

const Profile = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // US States array
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        if (profile) {
          setFormData(prevData => ({
            ...prevData,
            ...profile,
            email: currentUser.email // Always use the current user's email
          }));
        } else {
          // Initialize with default values if no profile exists
          const initialProfile = {
            companyName: '',
            contactName: '',
            email: currentUser.email,
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
          };
          await saveUserProfile(initialProfile);
          setFormData(initialProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Remove all non-numeric characters
      const cleanedValue = value.replace(/\D/g, '');
      
      // Format the phone number as (XXX) XXX-XXXX
      let formattedValue = '';
      if (cleanedValue.length > 0) {
        formattedValue = '(' + cleanedValue.substring(0, 3);
        if (cleanedValue.length > 3) {
          formattedValue += ') ' + cleanedValue.substring(3, 6);
          if (cleanedValue.length > 6) {
            formattedValue += '-' + cleanedValue.substring(6, 10);
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await saveUserProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to manage your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px'
          }}
        >
          Profile Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  color: '#111827',
                  fontWeight: 600
                }}
              >
                Company Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F3F4F6',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 555-5555"
                    inputProps={{ maxLength: 14 }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Select state</MenuItem>
                    {states.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    inputProps={{ maxLength: 10 }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSaving}
                  sx={{ 
                    minWidth: 120,
                    backgroundColor: '#4F46E5',
                    '&:hover': {
                      backgroundColor: '#4338CA',
                    },
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Profile; 