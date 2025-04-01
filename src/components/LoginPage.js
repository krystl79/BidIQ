import React, { useState } from 'react';
import { saveUserProfile } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { isValidZipCode } from '../utils/validation';

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isForgotPassword ? 'Reset your password' : (isSignup ? 'Create your account' : 'Sign in to your account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(error || authError) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error || authError}</p>
            </div>
          )}
          {authMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{authMessage}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {isSignup && !isForgotPassword && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                    Contact Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <div className="mt-1">
                    <select
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a state</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      required
                      maxLength="10"
                      pattern="\d{5}(-\d{4})?"
                      placeholder="12345 or 12345-6789"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter 5-digit ZIP code or 9-digit ZIP+4 code
                    </p>
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || authLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (loading || authLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading || authLoading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isSignup ? 'Sign up' : 'Sign in'))}
              </button>
            </div>

            <div className="text-sm text-center space-y-2">
              {!isForgotPassword && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="font-medium text-blue-600 hover:text-blue-500 block w-full"
                  >
                    {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="font-medium text-blue-600 hover:text-blue-500 block w-full"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="font-medium text-blue-600 hover:text-blue-500 block w-full"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 