import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
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
        throw new Error('An account with this email already exists');
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
          errorMessage += 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage += 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage += err.message;
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
          errorMessage += 'Invalid email or password.';
          break;
        case 'auth/user-not-found':
          errorMessage += 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email format.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage += err.message;
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

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 