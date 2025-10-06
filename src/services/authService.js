import { api, tokenManager } from './api';

export const authService = {
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData, { auth: false });
      
      if (response.success && response.token) {
        tokenManager.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password }, { auth: false });
      
      if (response.success && response.token) {
        tokenManager.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout endpoint failed:', error);
    } finally {
      
      tokenManager.removeToken();
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
      }
      
      throw new Error('Failed to fetch profile');
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await api.delete('/auth/account', {
        body: { password }
      });
      
      if (response.success) {
        tokenManager.removeToken();
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete account');
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return tokenManager.isAuthenticated() && !!authService.getCurrentUser();
  },

  refreshUser: async () => {
    try {
      if (tokenManager.isAuthenticated()) {
        return await authService.getProfile();
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      tokenManager.removeToken();
      return null;
    }
  }
};

export default authService;
