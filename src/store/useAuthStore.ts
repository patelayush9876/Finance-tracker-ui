import { create } from 'zustand';
import client from '../api/client';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  username?: string;
  isEmailVerified: boolean;
  settings?: UserSettings;
  role?: string;
}

interface UserSettings {
  id: string;
  userId: string;
  currency: string;
  theme: string;
  notificationsEnabled: boolean;
  subscriptionPlan: string;
}

interface AuthState {
  user: User | null;
  settings: UserSettings | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<any>;
  register: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  getMe: () => Promise<User | null>;
  updateProfile: (profile: any) => Promise<User>;
  updateSettings: (settings: any) => Promise<UserSettings>;
  seedMockData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  settings: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response: any = await client.post('/auth/login', credentials);
      const user = response.user;
      set({
        user,
        settings: user.settings || null,
        isAuthenticated: true,
        loading: false,
      });
      return user;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const user = await client.post('/auth/register', credentials);
      set({ loading: false });
      return user;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, settings: null, isAuthenticated: false });
    }
  },

  getMe: async () => {
    set({ loading: true, error: null });
    try {
      const user: any = await client.get('/auth/me');
      set({
        user,
        settings: user.settings || null,
        isAuthenticated: true,
        loading: false,
      });
      return user;
    } catch (err) {
      set({ user: null, settings: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  updateProfile: async (profile) => {
    set({ loading: true, error: null });
    try {
      const user: any = await client.patch('/users/profile', profile);
      set({ user, loading: false });
      return user;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Profile update failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  updateSettings: async (settings) => {
    set({ loading: true, error: null });
    try {
      const updatedSettings: any = await client.patch('/users/settings', settings);
      set({ settings: updatedSettings, loading: false });
      return updatedSettings;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Settings update failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  seedMockData: async () => {
    set({ loading: true, error: null });
    try {
      await client.post('/users/seed');
      set({ loading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Seeding failed';
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },
}));

