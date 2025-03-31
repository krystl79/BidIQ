import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const login = useCallback(async (email, password) => {
    try {
      setError('');
      setLoading(true);
      // Mock login for testing
      if (email === 'test@example.com' && password === 'password') {
        const user = { email, id: '1' };
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setCurrentUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 