// src/lib/api.js

const BASE_URL = 'http://localhost:8000'; // Your backend server address

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




/**
 * A helper function to handle API responses and errors consistently.
 * @param {Response} response - The raw response from the fetch API.
 * @returns {Promise<any>} - A promise that resolves with the JSON data.
 * @throws {Error} - Throws a custom error object on failure.
 */
const handleApiResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        // Handle cases where the server sends non-JSON (like the Django 403 HTML page)
        data = { detail: `The server sent a response that was not valid JSON. Status: ${response.status}` };
    }

    if (!response.ok) {
        const error = new Error(data.detail || 'An API error occurred');
        error.data = data;
        error.status = response.status;
        throw error;
    }
    return data;
};

/**
 * Fetches a CSRF token from the backend.
 * This is the first step in any CSRF-protected flow.
 * It ensures the browser receives and stores the `csrftoken` cookie.
 * @returns {Promise<string>} A promise that resolves with the CSRF token string.
 */
export const fetchCsrfToken = async () => {
    const response = await fetch(`${BASE_URL}/api/csrf-token/`, {
        // CRITICAL: This allows the browser to receive and store the cookie
        // from the cross-origin backend server.
        credentials: 'include',
    });
    const data = await handleApiResponse(response);
    return data.csrfToken;
};



/**
 * Posts data to a CSRF-protected authentication endpoint.
 * It correctly formats the data as 'application/x-www-form-urlencoded' and
 * ensures the CSRF cookie is sent with the request.
 *
 * @param {string} endpoint - The endpoint path (e.g., '/_allauth/browser/v1/auth/login').
 * @param {object} data - A plain JavaScript object with the form data (e.g., { email, password }).
 * @param {string} csrfToken - The CSRF token obtained from fetchCsrfToken.
 * @returns {Promise<any>} A promise that resolves with the JSON response from the server.
 */
export const postToAuthEndpoint = async (endpoint, data, csrfToken) => {
    // MODIFIED: We are now sending JSON, not URLSearchParams.
    const payload = JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            // The CSRF Token header is correct.
            'X-CSRFToken': csrfToken,
            // MODIFIED: The Content-Type must be application/json.
            'Content-Type': 'application/json',
        },
        body: payload,
    });
    return handleApiResponse(response);
};