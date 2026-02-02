import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setAuth: (user, access, refresh) => {
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true
        });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
      },
      
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },
      
      // Tokenlarni olish uchun helper
      getTokens: () => {
        const state = get();
        return {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken
        };
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);