import axios from 'axios';

// API URL from environment variables (defaults to localhost for development)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Add interceptor to automatically include auth headers
apiClient.interceptors.request.use((config) => {
  const savedCredentials = localStorage.getItem('abm2_auth');
  if (savedCredentials) {
    config.headers.Authorization = `Basic ${savedCredentials}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

