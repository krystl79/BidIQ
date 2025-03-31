import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful:', userCredential.user.email);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      console.error('Signup error:', err.code, err.message);
      setError(`Signup failed: ${err.message}`);
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
          errorMessage += 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Invalid email format.';
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