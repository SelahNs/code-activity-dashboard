import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

// Import all your pages and components
import DashboardPage from './pages/DashboardPage';
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ThemeProvider from './context/ThemeContext';
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
// Import your data source
import codingData from './data/data.json';
import { useNavigate } from "react-router-dom";
// This is now the main "brain" of your application
export default function App() {
    // 1. All state now lives here, in the top-level component

    const [selectedProject, setSelectedProject] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(() => {
        const rememberedUser = localStorage.getItem('codedash_user');
        if (rememberedUser) {
            return JSON.parse(rememberedUser);
        }
        const sessionUser = sessionStorage.getItem('codedash_user');
        if (sessionUser) {
            return JSON.parse(sessionUser);
        }
        return null;
    });


    useEffect(() => {
        if (currentUser) {
            if (currentUser.rememberMe) {
                localStorage.setItem('codedash_user', JSON.stringify(currentUser));
                sessionStorage.removeItem('codedash_user'); // Clean up the other storage
            }
            else {
                sessionStorage.setItem('codedash_user', JSON.stringify(currentUser));
                localStorage.removeItem('codedash_user'); // Clean up the other storage
            }
        } else {
            localStorage.removeItem('codedash_user');
            sessionStorage.removeItem('codedash_user');
        }
    }, [currentUser]);

    function updateUser(newUserData) {
        const updatedUser = { ...currentUser, ...newUserData };
        setCurrentUser(updatedUser);
    }

    // THIS FUNCTION IS THE KEY TO MAKING THE LOGIN WORK
    function handleLogin(userData, rememberMe) {
        setCurrentUser({ ...userData, rememberMe: rememberMe });
        navigate('/'); // Redirect to dashboard on successful login
    }
    function handleLogout() {
        setCurrentUser(null);
        navigate('/login'); // Redirect to login page after logout
    }


    // 3. All event handlers live here
    function handleClick(e) {
        const selected = e.target.value;
        if (selected === '') { // Special case for "All Projects"
            setSelectedProject([]);
            return;
        }
        if (selectedProject.includes(selected)) {
            setSelectedProject(selectedProject.filter(data => data !== selected));
        } else {
            setSelectedProject([...selectedProject, selected]);
        }
    }



    // 4. All data calculations are derived here
    const filteredData = useMemo(() => {
        if (selectedProject.length === 0) return codingData;
        return codingData.filter(data => selectedProject.includes(data.project));
    }, [selectedProject]);

    const projectNames = useMemo(() => [...new Set(codingData.map(data => data.project))], []);


    return (
        // The React Fragment <> is perfect for the root
        <ThemeProvider>
            {/* The Navbar receives the current path to hide the active link */}
            <Navbar currentPath={location.pathname} user={currentUser} onLogout={handleLogout} />

            {/* AnimatePresence manages the page transitions */}
            <AnimatePresence mode='wait'>
                <Routes location={location} key={location.pathname}>

                    {/* The DashboardPage now receives all the data and functions it needs as props */}
                    <Route
                        path={"/"}
                        element={
                            <DashboardPage

                                filteredData={filteredData}
                                projectNames={projectNames}
                                selectedProjects={selectedProject}
                                onProjectClick={handleClick}
                            />
                        }
                    />

                    {/* Your other pages are ready to be built out */}
                    <Route path={"/reports"} element={<ReportsPage />} />
                    <Route path={"/users"} element={<UsersPage />} />
                    <Route path={"/settings"} element={<SettingsPage user={currentUser} onProfileUpdate={updateUser} onLoginSuccess={handleLogin} />} />
                    <Route path={"/login"} element={<LoginPage onLoginSuccess={handleLogin} />} />
                    <Route path={"/signup"} element={<SignupPage />} />
                    <Route path={"/forgot-password"} element={<ForgotPasswordPage />} />
                    <Route path={"/projects"} element={<ProjectsPage />} />
                    <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

                </Routes>
            </AnimatePresence>
        </ThemeProvider>
    )
}
// projhects, reports, dashboar, goals and ficus, settings