// src/stores/useAuthStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dynamicStorage } from '../lib/storage'; // Import our custom storage manager

const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      user: null,
      accessToken: null,
      refreshToken: null,

      // --- COMPUTED PROPERTIES (GETTERS) ---
      isAuthenticated: () => get().accessToken !== null,

      // --- ACTIONS ---
      // The 'login' action now accepts the 'rememberMe' boolean to determine storage type.
      login: (data, rememberMe) => {
        // IMPORTANT: Set the storage preference *before* setting the state.
        // This tells our custom storage manager where to save the upcoming data.
        dynamicStorage.useLocalStorage = rememberMe;

        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });
      },

      // The 'logout' action clears all auth data from the state and storage.
      logout: () => {
        // Reset the storage preference on logout.
        dynamicStorage.useLocalStorage = false;
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'auth-storage', // The key name will be the same in both localStorage and sessionStorage.
      
      // We tell the persist middleware to use our custom dynamic storage manager
      // instead of the default localStorage.
      storage: {
        getItem: dynamicStorage.getItem,
        setItem: dynamicStorage.setItem,
        removeItem: dynamicStorage.removeItem,
      },
    }
  )
);

export default useAuthStore;