// src/lib/api.js

import useAuthStore from "../stores/useAuthStore";

const BASE_URL = 'http://localhost:3001'; // Your backend server address

// src/lib/api.js

/**
 * A robust, simplified fetch wrapper for API calls.
 *
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {object} [options={}] - Optional configuration for the fetch call.
 * @returns {Promise<any>} A promise that resolves with the JSON data on success.
 * @throws {{status: number, data: any}} A structured error object on failure.
 */
export const apiFetch = async (endpoint, options = {}) => {
    // 1. Set up the request
    const headers = {
        ...options.headers,
    };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const config = { ...options, headers };
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // 2. Safely get the response body as text. This step CANNOT fail.
        const responseText = await response.text();

        // 3. Try to parse the text as JSON. If it's empty, data will be null.
        //    If it's not valid JSON, we'll create a fallback error object.
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("The server sent a response that was not valid JSON.", responseText);
                // Create a consistent error data object for non-JSON responses
                data = { detail: "The server's response was unreadable." };
            }
        }

        // 4. Check if the request was successful (status 200-299).
        //    This is the single source of truth for success or failure.
        if (!response.ok) {
            // It's an error. Throw our predictable error object.
            // The `data` will be the parsed JSON error, or our fallback object.
            throw { status: response.status, data: data };
        }

        // 5. If we reach here, it's a success. Return the data.
        return data;

    } catch (error) {
        // This catch block handles two things:
        // 1. The custom error we just threw above.
        // 2. A true network failure (e.g., server is offline).

        // If it's not our structured error, it's a network problem.
        if (!error.status) {
            console.error("A network error occurred:", error);
            throw {
                status: 0, // Use 0 for network errors
                data: { detail: "Could not connect to the server." },
            };
        }

        // Otherwise, just re-throw our structured error for the component to handle.
        throw error;
    }
};

export const authApiFetch = async (endpoint, options = {}) => {
    // A function to perform the actual fetch with the current token
    const performFetch = async () => {
        const accessToken = useAuthStore.getState().accessToken;
        console.log("Inside performFetch. Access Token is:", accessToken);
        const headers = {
            ...options.headers,
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return apiFetch(endpoint, { ...options, headers })
    };

    try {
        return await performFetch();

    } catch (error) {
        if (error.status !== 401) {
            throw error;
        }

        console.log("Caught 401> Attempting to refresh token...");
        const { refreshToken, setTokens, logout } = useAuthStore.getState();

        if (!refreshToken) {
            logout();
            window.location.href = '/login';
            throw new Error('No refesh token, User logged out.');
        }

        try {
            const refreshData = await apiFetch('/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            })
            setTokens(refreshData.access, refreshToken);
            console.log('Token refresh succussfull. Retrying original request');
            return await performFetch();

        } catch (refreshError) {
            console.error("Refresh token invalid or expired. Logging out", refreshError);
            logout();
            window.location.href = '/login';
            throw new Error('Session  expired, Please lof in again.');
        }
    }
};


export const apiClient = {
    getProfile: () => {
        const result = authApiFetch('/api/profile/');
        console.log("the result form get prfoile is", result)
        return result
    },
    // updateProfile: (profileData) => {
    //     const options = {
    //         method: 'PUT',
    //         body: JSON.stringify(profileData),
    //     }
    //     return authApiFetch('/api/profile/', options);
    // },
    updateProfile: (profileData, avatarFile) => {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
            formData.append(key, profileData[key])
        });

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        return authApiFetch('/api/profile/', {
            method: 'PUT',
            body: formData, // no JSON.stringify here
        });
    },

    changePassword: (passwordData) => {
        const options = {
            method: 'POST',
            body: JSON.stringify(passwordData)
        };

        return authApiFetch('/_allauth/app/v1/account/password/change', options);
    },

    addEmail: (email) => {
        const options = {
            method: 'POST',
            body: JSON.stringify({ email: email }),
        };
        return authApiFetch('/_allauth/app/v1/account/email', options);
    },
}