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

// Import your data source
import codingData from './data/data.json';

// This is now the main "brain" of your application
export default function App() {
    // 1. All state now lives here, in the top-level component

    const [selectedProject, setSelectedProject] = useState([]);
    const location = useLocation();

    // 2. The theme effect also lives here


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
            <Navbar currentPath={location.pathname} />

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
                    <Route path={"/settings"} element={<SettingsPage />} />
                    <Route path={"/login"} element={<LoginPage />} />

                </Routes>
            </AnimatePresence>
        </ThemeProvider>
    )
}