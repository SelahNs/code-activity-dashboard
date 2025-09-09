// src/lib/storage.js

// This object implements the 'Storage' interface that Zustand's persist middleware expects.
// It acts as a wrapper around localStorage and sessionStorage to make our storage dynamic.

export const dynamicStorage = {
    // This flag determines which storage to use. We will set this from our auth store.
    useLocalStorage: false,

    setItem: (name, value) => {
        // FIX: The state 'value' is an object. We MUST stringify it before saving.
        const stringifiedValue = JSON.stringify(value);

        if (dynamicStorage.useLocalStorage) {
            localStorage.setItem(name, stringifiedValue); // Use the stringified value
        } else {
            sessionStorage.setItem(name, stringifiedValue); // Use the stringified value
        }
    },

    getItem: (name) => {
        // Your logic for checking both storages is great. Let's keep it.
        const fromLocalStorage = localStorage.getItem(name);
        const fromSessionStorage = sessionStorage.getItem(name);

        // Determine which stored string to use, based on your original logic.
        const storedValue = dynamicStorage.useLocalStorage
            ? fromLocalStorage
            : (fromSessionStorage || fromLocalStorage);

        // If nothing was found, return null as expected.
        if (!storedValue) {
            return null;
        }

        try {
            // FIX: The stored value is a string. We MUST parse it back into an object.
            return JSON.parse(storedValue);
        } catch (error) {
            // If the stored data is corrupted and not valid JSON, we'll log an error
            // and return null to prevent the app from crashing.
            console.error("Error parsing stored auth data:", error);
            return null;
        }
    },

    removeItem: (name) => {
        // Your existing logic here is perfect and robust. No changes needed.
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    },
};