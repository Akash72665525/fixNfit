import api from './api';

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getCurrentUser = () => {
  return api.get('/auth/me');
};

export const updateProfile = (profileData) => {
  return api.put('/users/profile', profileData);
};

export const updatePassword = (passwordData) => {
  return api.put('/auth/update-password', passwordData);
};
