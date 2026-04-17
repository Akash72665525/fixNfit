import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // =============================
  // Load user on app start
  // =============================
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const res = await authService.getCurrentUser();

      // Backend should return user object
      const userData = res.data?.user || res.data || res;

      setUser(userData);

    } catch (error) {
      console.error('Auth init failed:', error);

      localStorage.removeItem('token');
      setToken(null);
      setUser(null);

    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Login
  // =============================
  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);

      const data = res.data;

      const token = data?.token;
      const userData = data?.user;

      if (!token || !userData) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);

      setToken(token);
      setUser(userData);

      toast.success('Login successful');

      return { success: true };

    } catch (error) {

      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed';

      toast.error(message);

      return { success: false, message };
    }
  };

  // =============================
  // Register
  // =============================
  const register = async (userData) => {
    try {
      const res = await authService.register(userData);

      const data = res.data;

      const token = data?.token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error('Invalid registration response');
      }

      localStorage.setItem('token', token);

      setToken(token);
      setUser(user);

      toast.success('Registration successful');

      return { success: true };

    } catch (error) {

      const message =
        error.response?.data?.message ||
        error.message ||
        'Registration failed';

      toast.error(message);

      return { success: false, message };
    }
  };

  // =============================
  // Logout
  // =============================
  const logout = () => {

    localStorage.removeItem('token');

    setToken(null);
    setUser(null);

    toast.success('Logged out');
  };

  // =============================
  // Update profile
  // =============================
  const updateProfile = async (profileData) => {
    try {

      const res = await authService.updateProfile(profileData);

      const userData = res.data?.user || res.data || res;

      setUser(userData);

      toast.success('Profile updated');

      return { success: true };

    } catch (error) {

      const message =
        error.response?.data?.message ||
        'Profile update failed';

      toast.error(message);

      return { success: false, message };
    }
  };

  // =============================
  // Context Value
  // =============================
  const value = {
    user,
    token,
    loading,

    login,
    register,
    logout,
    updateProfile,

    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  // =============================
  // Loader
  // =============================
  if (loading) {
    return (
      <div className="app-loader">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
