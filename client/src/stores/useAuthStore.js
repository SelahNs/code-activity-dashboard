import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
    /**
     * --- STATE ---
     * The only piece of state we need to manage on the client is the user object itself.
     * If `user` is null, the user is logged out. If it has data, they are logged in.
     */
    user: null,

    /**
     * --- GETTERS (COMPUTED PROPERTIES) ---
     * A simple function to quickly check if the user is authenticated.
     */
    isAuthenticated: () => get().user !== null,

    /**
     * --- ACTIONS ---
     */

    /**
     * Sets the user data in the store upon a successful login.
     * @param {object} userData The user object received from the backend.
     */
    login: (userData) => {
        set({ user: userData });
    },

    /**
     * Clears the user data from the store.
     * This should be called after a successful call to the backend's /logout endpoint.
     */
    logout: () => {
        set({ user: null });
    },
}));

export default useAuthStore;