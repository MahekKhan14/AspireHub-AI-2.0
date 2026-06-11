import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('careerai_token');
      localStorage.removeItem('careerai_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('careerai_token');
    if (!token) { setLoading(false); return; }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('careerai_token');
      localStorage.removeItem('careerai_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('careerai_token', data.token);
    setUser(data.user);
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('careerai_token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('careerai_token');
    localStorage.removeItem('careerai_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated: !!user,
      register, login, logout, updateUser, loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
