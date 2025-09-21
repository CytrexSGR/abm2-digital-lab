import { useState, useEffect } from 'react';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  credentials: string | null;
  error: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    credentials: null,
    error: null,
    loading: false
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('abm2_auth');
    const savedUsername = localStorage.getItem('abm2_username');

    if (savedCredentials && savedUsername) {
      // Verify credentials are still valid
      verifyCredentials(savedCredentials, savedUsername);
    }
  }, []);

  const verifyCredentials = async (credentials: string, username: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Test API call with stored credentials
      await axios.get('/api/health', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      // Credentials are valid
      setAuthState({
        isAuthenticated: true,
        username,
        credentials,
        error: null,
        loading: false
      });

      // Set default auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;

    } catch (error) {
      // Credentials invalid, clear them
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Encode credentials for Basic Auth
      const credentials = btoa(`${username}:${password}`);

      // Test the credentials with a protected endpoint
      await axios.get('/api/simulation/data', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      // Login successful
      const newAuthState = {
        isAuthenticated: true,
        username,
        credentials,
        error: null,
        loading: false
      };

      setAuthState(newAuthState);

      // Store credentials in localStorage
      localStorage.setItem('abm2_auth', credentials);
      localStorage.setItem('abm2_username', username);

      // Set default auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;

    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.status === 401
          ? 'Ungültige Anmeldedaten'
          : 'Anmeldefehler. Bitte versuchen Sie es erneut.'
      }));
    }
  };

  const logout = () => {
    // Clear auth state
    setAuthState({
      isAuthenticated: false,
      username: null,
      credentials: null,
      error: null,
      loading: false
    });

    // Clear stored credentials
    localStorage.removeItem('abm2_auth');
    localStorage.removeItem('abm2_username');

    // Remove default auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  return {
    ...authState,
    login,
    logout
  };
};