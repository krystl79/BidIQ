import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      console.log('Attempting signup with email:', email);
      
      // Check if user already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.log('User already exists with methods:', signInMethods);
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful:', userCredential.user.email);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      console.error('Signup error:', err.code, err.message);
      let errorMessage = 'Signup failed. ';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please log in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      console.log('Attempting login with email:', email);

      // Check if user exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        console.log('No account found for email:', email);
        throw new Error('No account found with this email. Please sign up first.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      let errorMessage = 'Login failed. ';
      switch (err.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError('');
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err.code, err.message);
      setError(`Logout failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      console.log('Attempting password reset for email:', email);

      // Check if user exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        throw new Error('No account found with this email. Please sign up first.');
      }

      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err.code, err.message);
      let errorMessage = 'Password reset failed. ';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please enter a valid email address.';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
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