import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

import DashboardPage from './pages/DashboardPage';
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import InsightsPage from "./pages/InsightsPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ThemeProvider from './context/ThemeContext';
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ShowcasePage from "./pages/ShowcasePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResendVerificationPage from "./pages/ResendVerificationPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import Toast from './components/Toast';
import useAuthStore from "./stores/useAuthStore";
import useNotificationStore from "./stores/useNotificationStore";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AuthSuccessPage from "./pages/AuthSuccessPage"

// We'll build this next
import LandingPage from "./pages/LandingPage";

export default function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    function handleLogout() {
        logout();
        navigate('/landing');
    }

    return (
        <>
            <ThemeProvider>
                <Navbar
                    currentPath={location.pathname}
                    user={currentUser}
                    onLogout={handleLogout}
                />

                <AnimatePresence mode='wait'>
                    <Routes location={location} key={location.pathname}>

                        <Route element={<PublicRoute />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                        </Route>

                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/settings" element={<SettingsPage user={currentUser} />} />
                            <Route path="/insights" element={<InsightsPage/>} />
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                        </Route>

                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/verify-email" element={<EmailVerificationPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/resend-verification" element={<ResendVerificationPage />} />
                        <Route path="/showcase" element={<ShowcasePage />} />
                        <Route path="/auth-success" element={<AuthSuccessPage />} />

                    </Routes>
                </AnimatePresence>
            </ThemeProvider>
            <Toast />
        </>
    );
}