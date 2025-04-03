import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { saveUserProfile } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { isValidZipCode } from '../utils/validation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

const LoginPage = () => {
  const { login, signup, resetPassword, loading: authLoading, error: authError, message: authMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    contactName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

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
    } else if (name === 'zipCode') {
      // Remove all non-numeric characters
      const cleanedValue = value.replace(/\D/g, '');
      
      // Format the ZIP code as XXXXX or XXXXX-XXXX
      let formattedValue = '';
      if (cleanedValue.length > 0) {
        formattedValue = cleanedValue.substring(0, 5);
        if (cleanedValue.length > 5) {
          formattedValue += '-' + cleanedValue.substring(5, 9);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email) {
        setError('Please enter your email address');
        return;
      }

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      await resetPassword(formData.email);
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      if (isSignup) {
        // Additional validation for signup
        const requiredFields = [
          { name: 'companyName', label: 'Company Name' },
          { name: 'contactName', label: 'Contact Name' },
          { name: 'phone', label: 'Phone' },
          { name: 'address', label: 'Address' },
          { name: 'city', label: 'City' },
          { name: 'state', label: 'State' },
          { name: 'zipCode', label: 'ZIP Code' }
        ];

        const missingFields = requiredFields.filter(field => !formData[field.name]);
        if (missingFields.length > 0) {
          setError(`Please fill in all required fields:\n${missingFields.map(field => field.label).join('\n')}`);
          return;
        }

        // Validate ZIP code
        if (!isValidZipCode(formData.zipCode)) {
          setError('Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
          return;
        }

        // Create the user account
        const userCredential = await signup(formData.email, formData.password);
        
        // Save profile data
        await saveUserProfile({
          ...formData,
          uid: userCredential.user.uid
        });
      } else {
        // Attempt to log in
        console.log('Attempting login with:', { email: formData.email });
        await login(formData.email, formData.password);
      }

      // Navigate to the intended destination or dashboard
      const from = location.state?.from || '/dashboard';
      navigate(from);
    } catch (error) {
      console.error('Auth error:', error);
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        // If account exists, switch to login mode
        setIsSignup(false);
        setError('An account with this email already exists. Please log in instead.');
      } else if (error.message.includes('No account found')) {
        // If no account exists, switch to signup mode
        setIsSignup(true);
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isSignup ? 'Create Account' : isForgotPassword ? 'Reset Password' : 'Sign In'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isSignup 
              ? 'Create your account to get started' 
              : isForgotPassword 
                ? 'Enter your email to reset your password'
                : 'Sign in to your account'}
          </Typography>
        </Box>

        {(error || authError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || authError}
          </Alert>
        )}

        {authMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {authMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          {!isForgotPassword && (
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          )}

          {isSignup && !isForgotPassword && (
            <>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Contact Name"
                name="contactName"
                required
                value={formData.contactName}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="City"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  label="State"
                  required
                >
                  {states.map(state => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                required
                value={formData.zipCode}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || authLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading || authLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isSignup ? (
              'Create Account'
            ) : isForgotPassword ? (
              'Reset Password'
            ) : (
              'Sign In'
            )}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {!isForgotPassword ? (
              <>
                <Button
                  onClick={() => setIsSignup(!isSignup)}
                  sx={{ mr: 1 }}
                >
                  {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
                <Button
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsForgotPassword(false)}
              >
                Back to sign in
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 