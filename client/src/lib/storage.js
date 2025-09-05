// src/lib/storage.js

// This object implements the 'Storage' interface that Zustand's persist middleware expects.
// It acts as a wrapper around localStorage and sessionStorage to make our storage dynamic.

export const dynamicStorage = {
    // This flag determines which storage to use. We will set this from our auth store.
    useLocalStorage: false,

    setItem: (name, value) => {
        if (dynamicStorage.useLocalStorage) {
            localStorage.setItem(name, value);
        } else {
            sessionStorage.setItem(name, value);
        }
    },

    getItem: (name) => {
        // We check both storages to handle cases where a user might log in with "Remember Me"
        // and then log in again without it in the same session.
        const fromLocalStorage = localStorage.getItem(name);
        const fromSessionStorage = sessionStorage.getItem(name);

        // Prioritize the storage type that is currently supposed to be in use.
        // Fall back to the other if needed.
        return dynamicStorage.useLocalStorage
            ? fromLocalStorage
            : (fromSessionStorage || fromLocalStorage);
    },

    removeItem: (name) => {
        // On logout, we should clear the auth key from both storages to be safe.
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    },
};