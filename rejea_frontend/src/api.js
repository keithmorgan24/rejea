// src/api.js
import axios from 'axios';

const api = axios.create({
  // Use localhost instead of 127.0.0.1 to avoid Windows IPv6 conflicts
  baseURL: 'http://localhost:8000/api', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;


