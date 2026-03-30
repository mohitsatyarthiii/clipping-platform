import { create } from 'zustand';
import { storage } from '@/lib/storage';
import api from '@/lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      console.log('🔐 Attempting login with email:', email);
      
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response: missing token or user data');
      }

      console.log('💾 Storing credentials...');
      storage.setToken(token);
      storage.setRole(user.role);
      storage.setUserData(user);

      console.log('📝 Updating auth store...');
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✨ Login successful, user role:', user.role);
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      console.error('❌ Login error:', errorMsg, error);
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, confirmPassword) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });
      const { token, user } = response.data;

      storage.setToken(token);
      storage.setRole(user.role);
      storage.setUserData(user);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    storage.clear();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = storage.getToken();
    const userData = storage.getUserData();

    if (token && userData) {
      set({
        token,
        user: userData,
        isAuthenticated: true,
      });
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put('/profile/update', updates);
      const updatedUser = response.data.user;

      storage.setUserData(updatedUser);
      set({ user: updatedUser, isLoading: false });

      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Profile update failed.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      set({ isLoading: true, error: null });
      await api.put('/profile/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      set({ isLoading: false, error: null });
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || 'Password change failed.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },
}));
