import { create } from 'zustand'
import { apiClient } from '../lib/api'

const useUserStore = create((set, get) => ({
  userData: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchUser: async () => {
    const lastFetched = get().lastFetched
    if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) return 
    set({ isLoading: true, error: null})
    try {
      const data = await apiClient.getMe()
      set({
        userData: data,
        isLoading: false,
        lastFetched: Date.now()
      })
    } catch (error) {
      set({error: error.data?.error || 'Failed to fetch user', isLoading: false})
    }
  },

  updateUser: (updatedData) => {
    set({ userData: updatedData})
  }, 

  clearUser: () => {
    set({ userData: null, lastFetched: null, error: null})
  }
}))

export default useUserStore