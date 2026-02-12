// src/stores/useAuthStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dynamicStorage } from '../lib/storage'; // Import our custom storage manager
import { apiClient } from '../lib/api';
import { email } from 'zod';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- STATE ---
      user: null,
      accessToken: null,
      refreshToken: null,

      profile: {
        fullName: '',
        username: '',
        email: '',
        avatarUrl:''
      },

      // --- COMPUTED PROPERTIES (GETTERS) ---
      isAuthenticated: () => get().accessToken !== null,

      setTokens: (newAccessToken, newRefreshToken) => {
        set({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      },
      updateGlobalProfile: (newProfileData) => {
        set(state => ({
          profile: {
            ...state.profile,
            fullName: newProfileData.user.full_name,
            avatarUrl: newProfileData.avatar_url,
          }
        }));
      },

      // --- ACTIONS ---
      // The 'login' action now accepts the 'rememberMe' boolean to determine storage type.
      login: async (loginAPIResponse, rememberMe) => {

        try {
          // IMPORTANT: Set the storage preference *before* setting the state.
          // This tells our custom storage manager where to save the upcoming data.
          dynamicStorage.useLocalStorage = rememberMe;

          set({
            user: loginAPIResponse.data.user,
            accessToken: loginAPIResponse.meta.access_token,
            refreshToken: loginAPIResponse.meta.refresh_token,
          });

          const profileData = await apiClient.getProfile();

          set((state) => ({
            fullName: profileData.user.full_name,
            avatarUrl: profileData.avatar_url,
          }));

        } catch (error) {
          console.error("Error during post-login profile fetch:", error);
        }
      },

      // The 'logout' action clears all auth data from the state and storage.
      logout: () => {
        // Reset the storage preference on logout.
        dynamicStorage.useLocalStorage = false;
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
           profile: { fullName: '', avatarUrl: ''}
        });
      },
      fetchUserProfile: async () => {
        try {

          const profileData = await apiClient.getProfile();
          console.log('Fetched profile data:', profileData);
          set({ user: profileData });
        } catch (error) {
          console.log("Failed to fetch fresh user profile:", error);
        }
      },

      updateUserProfile: async (profileUpdateData, avatarFile) => {
        try {
          const updatedProfile = await apiClient.updateProfile(profileUpdateData, avatarFile);
          set({ user: updatedProfile });

          // Return a success signal to the component
          return { success: true, data: updatedProfile };
        } catch (error) {
          console.error('Failed to update user profile:', error);
          return { success: false, error: error.data || error };
        }
      }
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