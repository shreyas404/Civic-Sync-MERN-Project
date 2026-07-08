import axios from 'axios';

// Create a re-usable "instance" of axios that knows our backend's address
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL, // The address of your backend server
});

// This is an "interceptor"
// It's a function that runs BEFORE every API request is sent.
// It checks if we have a token in localStorage and adds it to the request header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;