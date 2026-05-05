// src/lib/storage.js

export const dynamicStorage = {
    useLocalStorage: false,

    setItem: (name, value) => {
        const stringifiedValue = JSON.stringify(value);
        if (dynamicStorage.useLocalStorage) {
            localStorage.setItem(name, stringifiedValue);
            sessionStorage.removeItem(name); // ← clean up the other one
        } else {
            sessionStorage.setItem(name, stringifiedValue);
            localStorage.removeItem(name); // ← clean up the other one
        }
    },

    getItem: (name) => {
        // Try localStorage first if that's what we're using
        if (dynamicStorage.useLocalStorage) {
            const fromLocal = localStorage.getItem(name);
            if (fromLocal) return JSON.parse(fromLocal);
            return null;
        }

        // Otherwise try sessionStorage, then fall back to localStorage
        const fromSession = sessionStorage.getItem(name);
        if (fromSession) {
            const parsed = JSON.parse(fromSession);
            // Check if the state actually has real data, not nulls
            if (parsed?.state?.accessToken) return parsed;
        }

        const fromLocal = localStorage.getItem(name);
        if (fromLocal) return JSON.parse(fromLocal);

        return null;
    },

    removeItem: (name) => {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
    },
};