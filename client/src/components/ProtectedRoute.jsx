import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../stores/useAuthStore';

export default function ProtectedRoute() {
    const accessToken = useAuthStore(state => state.accessToken);
    const refreshToken = useAuthStore(state => state.refreshToken);
    const logout = useAuthStore(state => state.logout);

    console.log('Access token:', accessToken)
    if (!accessToken) {
        return <Navigate to="/landing" replace />;
    }

    try {
        const decoded = jwtDecode(accessToken);
        const isExpired = decoded.exp < Date.now() / 1000;

        if (isExpired) {
            if (!refreshToken) {
                logout();
                return <Navigate to="/landing" replace />;
            }

            
            return <Outlet />;
        }

        return <Outlet />;

    } catch {
        logout();
        return <Navigate to="/landing" replace />;
    }
}