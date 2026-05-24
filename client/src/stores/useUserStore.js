import { create } from 'zustand'
import { apiClient } from '../lib/api'
import useAuthStore from './useAuthStore'

const useUserStore = create((set, get) => ({
  userData: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchUser: async () => {
    const lastFetched = get().lastFetched
    // Use cached data if updated within the last 5 minutes
    if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) return 
    set({ isLoading: true, error: null })
    try {
      const data = await apiClient.getMe()
      set({
        userData: data,
        isLoading: false,
        lastFetched: Date.now()
      })
    } catch (error) {
      set({ error: error.data?.error || 'Failed to fetch user', isLoading: false })
    }
  },

  updateUserProfile: async (profileFields) => {
    set({ isLoading: true, error: null })
    try {
      // Sends pure JSON payload to match the backend expectation
      const data = await apiClient.updateMe(profileFields)
      
      set({
        userData: data,
        isLoading: false,
        lastFetched: Date.now()
      })

      // Sync updated nested user info back to session useAuthStore
      if (data) {
        useAuthStore.getState().updateUser(data)
      }

      return { success: true, data }
    } catch (error) {
      const errorMsg = error.data?.error || error.data?.detail || 'Failed to update profile'
      set({ error: errorMsg, isLoading: false })
      return { success: false, error: { detail: errorMsg } }
    }
  },

  updateUser: (updatedData) => {
    set({ userData: updatedData })
  }, 

  clearUser: () => {
    set({ userData: null, lastFetched: null, error: null })
  }
}))

export default useUserStore