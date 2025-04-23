import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../services/db';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const signup = async (email, password) => {
    try {
      // In a real app, you would validate credentials here
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
      };
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      // Save or update user profile in IndexedDB
      await saveUserProfile({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // In a real app, you would validate credentials here
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
      };
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      // Save or update user profile in IndexedDB
      await saveUserProfile({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // In a real app, you would send a password reset email here
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    message,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 