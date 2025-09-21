import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
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

