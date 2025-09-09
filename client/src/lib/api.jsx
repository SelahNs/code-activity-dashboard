// src/lib/api.js

const BASE_URL = 'http://127.0.0.1:8000'; // Your backend server address

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
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const config = { ...options, headers };
    const url = `http://127.0.0.1:8000${endpoint}`;

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
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const config = { ...options, headers };
        const url = `${BASE_URL}${endpoint}`;
        return fetch(url, config);
    };

    let response = await performFetch();

    if (response.status === 401) {
        console.log('Caught 401 Unauthorized. Attempting to refresh token...');
        const { refreshToken, login, logout, user, rememberMe } = useAuthStore.getState();

        if (!refreshToken) {
            logout();
            window.location.href = '/login';
            throw new Error('No refresh token available. User logged out.');
        }

        try {
            // Make the call to the refresh endpoint
            const refreshResponse = await fetch(`${BASE_URL}/_allauth/app/v1/auth/token/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            const refreshData = await refreshResponse.json();

            if (!refreshResponse.ok) {
                console.error("Refresh token is invalid or expired. Logging out.");
                logout();
                window.location.href = '/login';
                throw new Error('Session expired. Please log in again.');
            }

            console.log('Token refresh successful. Retrying original request.');
            // Update the store with the new tokens
            login({ user, ...refreshData }, rememberMe);

            // Retry the original request with the new token
            response = await performFetch();

        } catch (error) {
            console.error('An error occurred during token refresh:', error);
            throw error; // Re-throw the error to be caught by the component
        }
    }

    // Process the final response (either original or retried)
    if (response.status === 204) return { ok: true };
    const data = await response.json();
    if (!response.ok) throw { status: response.status, data };
    return data;
};