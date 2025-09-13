import useAuthStore from '../stores/useAuthStore';

const BASE_URL = 'http://localhost:8000';

/**
 * A utility function to read a specific cookie's value by its name from localStorage.
 * This is essential for retrieving the CSRF token that Django sets.
 * @param {string} name The name of the cookie to find (e.g., 'csrftoken').
 * @returns {string|null} The value of the cookie, or null if not found.
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * The NEW universal API client for all authenticated requests.
 * It automatically handles credentials (cookies) and CSRF protection.
 * Cookies like CSRF & sessionid are sent with each request.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const config = {
        ...options,
        // CRITICAL: This ensures that cookies (like sessionid) are sent with every request.
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            // Automatically add the CSRF token for any request that changes state.
            ...(options.method && options.method.toUpperCase() !== 'GET' && {
                'X-CSRFToken': getCookie('csrftoken'),
            }),
            ...options.headers,
        },
    };
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        // Handle empty responses (like a 204 No Content).
        if (response.status === 204) {
            return null;
        }

        const responseText = await response.text();
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw { status: 500, data: { detail: "The server sent an unreadable response." } };
            }
        }

        if (!response.ok) {
            // If the server says our session is invalid, log out on the frontend immediately.
            if (response.status === 401) {
                const { logout } = useAuthStore.getState();
                logout();
            }
            throw { status: response.status, data: data };
        }

        return data;

    } catch (error) {
        // If the error is a network failure, standardize it.
        if (error.status === undefined) {
            console.error("A network error occurred:", error);
            throw {
                status: 0,
                data: { detail: "Could not connect to the server." },
            };
        }
        // Otherwise, re-throw the standardized error from the server.
        throw error;
    }
};

/**
 * Fetches an initial CSRF token from the backend.
 * This is the first step for any flow that needs to POST data, like login or signup.
 */
export const fetchCsrfToken = async () => {
    // We can use our main client for consistency.
    const response = await apiFetch('/api/csrf-token/', { method: 'GET' });
    return response.csrfToken;
};

/**
 * A dedicated helper for posting to an authentication endpoint.
 * This makes the code in login/signup components more readable.
 */
export const postToAuthEndpoint = async (endpoint, data, csrfToken) => {
    return apiFetch(endpoint, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: JSON.stringify(data),
    });
};
