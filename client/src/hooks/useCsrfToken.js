import { useState, useEffect } from "react";
import { apiFetch } from '../lib/api'
import useNotificationStore from '../stores/useNotificationStore'


export function useCsrfToken() {
    const [csrfToken, setCsrfToken] = useState(null);
    const [isCsrfLoading, setIsCsrfLoading] = useState(true);
    const showNotification = useNotificationStore((state)=> state.showNotification);

    useEffect(()=> {
        const fetchCsrfToken = async () => {
            try {
                const data = await apiFetch('/api/csrf-token/', {
                    credentials: 'include',
                });
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error("Failed to fetch CSRF token:", error);
                showNotification('Could not establish a secure connection. Please try again', 'error' );
            } finally {
                setIsCsrfLoading(false);
            }    
        };
        fetchCsrfToken();
    }, [showNotification]);
    
    return { csrfToken, isCsrfLoading };
}