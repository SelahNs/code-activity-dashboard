import useAuthStore from "../stores/useAuthStore";

const BASE_URL = 'http://localhost:3001'; 

export const apiFetch = async (endpoint, options = {}) => {
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
        const responseText = await response.text();

        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("The server sent a response that was not valid JSON.", responseText);
                data = { detail: "The server's response was unreadable." };
            }
        }

        if (!response.ok) {
            throw { status: response.status, data: data };
        }
        return data;

    } catch (error) {
        if (!error.status) {
            console.error("A network error occurred:", error);
            throw {
                status: 0, // Use 0 for network errors
                data: { detail: "Could not connect to the server." },
            };
        }

        throw error;
    }
};

export const authApiFetch = async (endpoint, options = {}) => {
    const performFetch = async () => {
        const accessToken = useAuthStore.getState().accessToken;
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

        const { refreshToken, setTokens, logout } = useAuthStore.getState();

        if (!refreshToken) {
            logout();
            window.location.href = '/login';
            throw new Error('No refesh token, User logged out.');
        }

        try {
            const refreshData = await apiFetch('/api/token/refresh', {
                method: 'POST',
                body: JSON.stringify({ refresh: refreshToken }),
            })

            setTokens(refreshData.access, refreshToken);
            console.log('Token refresh succussfull. Retrying original request');
            return await performFetch();

        } catch (refreshError) {
            console.error("Refresh token invalid or expired. Logging out", refreshError);
            logout();
            window.location.href = '/login';
            throw new Error('Session  expired');
        }
    }
};


export const apiClient = {
    getMe: () => authApiFetch('/api/users/me'),
    updateMe: (profileData, avatarFile) => {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
            formData.append(key, profileData[key])
        });

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        return authApiFetch('/api/users/me', {
            method: 'PUT',
            body: formData, // no JSON.stringify here
        });
    },
    getProjects: () => authApiFetch('/api/projects'),
    getArchivedProjects: () => authApiFetch('/api/projects/archived'),
    getProject: (id) => authApiFetch(`/api/projects/${id}`),
    createProject: (data) => authApiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateProject: (id, data) => authApiFetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    archiveProject: (id) => authApiFetch(`/api/projects/${id}/archive`, {
        method: 'PATCH'
    }),
    restoreProject: (id) => authApiFetch(`/api/projects/${id}/restore`, {
        method: 'PATCH'
    }),
    deleteProject: (id) => authApiFetch(`/api/projects/${id}`, {
        method: 'DELETE'
    }),
    linkGithub: (id, repoId) => authApiFetch(`/api/projects/${id}/link-github`, {
        method: 'PATCH',
        body: JSON.stringify({repoId})
    }),
    unlinkGithub: (id) => authApiFetch(`/api/projects/${id}/unlink-github`, {
        method: 'PATCH'
    }),
    getRepos: () => authApiFetch('/api/repos'),
}