import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dynamicStorage } from '../lib/storage';
import socket from '../utils/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({

      // --- STATE ---
      // Single source of truth for user data
      user: null,
      accessToken: null,
      refreshToken: null,

      // --- ACTIONS ---
      login: (loginAPIResponse, rememberMe) => {
        // Set storage preference FIRST
        dynamicStorage.useLocalStorage = rememberMe;

        // Save everything from login response
        // No second API call needed — backend sends what we need
        set({
          user: loginAPIResponse.data.user,
          accessToken: loginAPIResponse.meta.access_token,
          refreshToken: loginAPIResponse.meta.refresh_token,
        });

        socket.io.opts.query = {userId: loginAPIResponse.data.user.id}
        socket.connect();
      },

      logout: () => {
    // Clear both storages completely
    localStorage.removeItem('auth-storage');
    sessionStorage.removeItem('auth-storage');
    
    // Reset storage preference
    dynamicStorage.useLocalStorage = false;
    
    // Clear the state
    set({
        user: null,
        accessToken: null,
        refreshToken: null,
    });
    socket.disconnect();
},
      // Used by token refresh in apiFetch
      setTokens: (newAccessToken, newRefreshToken) => {
        set({ 
          accessToken: newAccessToken, 
          refreshToken: newRefreshToken 
        });
      },

      // Called after user updates their profile
      // Updates the user object in store with fresh data
      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: dynamicStorage.getItem,
        setItem: dynamicStorage.setItem,
        removeItem: dynamicStorage.removeItem,
      },
    }
  )
);

export default useAuthStore;