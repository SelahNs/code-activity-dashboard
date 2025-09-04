// src/stores/useNotificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
    message: '',
    type: 'success', // can be 'success' or 'error'
    isVisible: false,

    // This is an "action" that components can call to show a notification
    showNotification: (message, type = 'success') => {
        set({ message, type, isVisible: true });
        // Automatically hide it after 4 seconds
        setTimeout(() => {
            set({ isVisible: false });
        }, 4000);
    },

    // An action to hide it manually if needed
    hideNotification: () => set({ isVisible: false }),
}));

export default useNotificationStore;