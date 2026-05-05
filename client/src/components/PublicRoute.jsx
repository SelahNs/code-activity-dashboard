import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../stores/useAuthStore';

export default function PublicRoute() {
    const accessToken = useAuthStore(state => state.accessToken);
    console.log('PublicRoute accessToken:', accessToken); // ← add this

    if (!accessToken) {
        return <Outlet />;
    }

    try {
        const decoded = jwtDecode(accessToken);
        const isExpired = decoded.exp < Date.now() / 1000;

        if (isExpired) {
            return <Outlet />;
        }

        return <Navigate to="/dashboard" replace />;

    } catch {
        return <Outlet />;
    }
}