// src/stores/authStore.js

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('access_token', userData.access_token);
    set({ user: userData.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        set({ user, isAuthenticated: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;

