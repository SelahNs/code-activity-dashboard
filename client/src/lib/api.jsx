// src/lib/api.js

const BASE_URL = 'http://127.0.0.1:8000'; // Your backend server address

/**
 * A wrapper around the native `fetch` function that automatically handles:
 *  - Prepending the base API URL.
 *  - Adding the `Content-Type: application/json` header.
 *  - Attaching the JWT access token to the `Authorization` header if it exists.
 *  - Parsing the JSON response.
 *  - Throwing a structured error on a failed (non-ok) response.
 *
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/profile/').
 * @param {object} [options={}] - Optional configuration for the fetch call (e.g., method, body).
 * @returns {Promise<any>} A promise that resolves with the JSON data from the API.
 */
export const apiFetch = async (endpoint, options = {}) => {
    // Get the access token from localStorage.
    const accessToken = localStorage.getItem('accessToken');

    // Set up the default headers.
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Allow custom headers to be passed in and override defaults.
    };

    // If a token exists, add the "Bearer" authorization header.
    // if (accessToken) {
    //     headers['Authorization'] = `Bearer ${accessToken}`;
    // }

    // Combine the default options, any passed-in options, and the final headers.
    const config = {
        ...options,
        headers,
    };

    // Construct the full URL for the API request.
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Some successful API calls (like a DELETE request) might return a 204 No Content status.
        // In this case, there is no JSON body to parse, so we return a simple success object.
        if (response.status === 204) {
            return { ok: response.ok, status: response.status };
        }

        // For all other responses, try to parse the JSON body.
        const data = await response.json();

        // If the response was not successful (e.g., 400, 401, 404, 500), throw an error.
        // We throw an object containing the status and the parsed data so our components
        // can inspect the error details from the backend.
        if (!response.ok) {
            throw { status: response.status, data };
        }

        // If the response was successful, return the parsed JSON data.
        return data;
    } catch (error) {
        // Log the error for debugging purposes and re-throw it so that the
        // calling component's own `catch` block can handle it.
        console.error(`API Fetch Error: ${error.status}`, error.data || error.message);
        throw error;
    }
};