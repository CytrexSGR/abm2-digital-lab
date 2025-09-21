import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

