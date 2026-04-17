import axios from 'axios';

// Determine API base URL:
// - In production (Vercel), REACT_APP_API_URL must be set to the Render backend URL
// - In development, falls back to localhost:5000
const inferredBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: inferredBase,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';

    // Only perform global redirect/remove-token for 401s from protected endpoints.
    // If the request was an authentication action (login/register/forgot/reset),
    // let the caller handle the error so a clear message can be shown.
    const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/forgot-password') || reqUrl.includes('/auth/reset-password');

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      try { window.location.href = '/login'; } catch (e) { /* ignore */ }
    }
    return Promise.reject(error);
  }
);

export default api;
