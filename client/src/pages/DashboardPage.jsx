// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiCalendar } from 'react-icons/fi';
import StatCard from '../components/StatCard';
import ProductivityChart from '../components/ProductivityChart';
import PerformanceSummary from '../components/PerformanceSummary';
import LiveSession from '../components/LiveSession';
import ActiveProjects from '../components/ActiveProjects';
import RecentActivity from '../components/RecentActivity';
import AiSuggestions from '../components/AiSuggestions';
import Milestones from '../components/Milestones';
import DateRangePicker from '../components/DateRangePicker'; // Assuming this is now in its own file

// --- MOCK DATA IS NOW RESTORED HERE ---
// This data is structured to test our filter logic.
const MOCK_SESSIONS = [
    // Last few days (for "This Week")
    { date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), duration: 125, keystrokes: 15000, linesAdded: 350, language: 'JavaScript', project: 'Dashboard-UI' },
    { date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), duration: 180, keystrokes: 22000, linesAdded: 500, language: 'React', project: 'Dashboard-UI' },
    { date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), duration: 90, keystrokes: 8000, linesAdded: 150, language: 'CSS', project: 'Marketing-Site' },
    // Last week
    { date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), duration: 240, keystrokes: 30000, linesAdded: 700, language: 'JavaScript', project: 'API-Service' },
    { date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(), duration: 60, keystrokes: 5000, linesAdded: 80, language: 'Python', project: 'Data-Script' },
    // Last month
    { date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), duration: 150, keystrokes: 18000, linesAdded: 400, language: 'React', project: 'Dashboard-UI' },
    { date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), duration: 200, keystrokes: 25000, linesAdded: 600, language: 'JavaScript', project: 'API-Service' },
    { date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), duration: 110, keystrokes: 12000, linesAdded: 250, language: 'Python', project: 'Data-Script' },
];

export default function DashboardPage({ user }) { // The `allSessions` prop is no longer needed
    const [dateRange, setDateRange] = useState('This Week');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const now = new Date();
        // The filter logic now uses our MOCK_SESSIONS constant
        const filterData = (sessions) => {
            return sessions.filter(session => {
                const sessionDate = new Date(session.date);
                if (dateRange === 'This Week') {
                    // Get the date for 7 days ago
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return sessionDate >= oneWeekAgo;
                }
                if (dateRange === 'This Month') {
                    // Get the date for 30 days ago for simplicity
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setDate(now.getDate() - 30);
                    return sessionDate >= oneMonthAgo;
                }
                // 'All Time'
                return true;
            },[...sessions]);
        };
        
        setFilteredData(filterData(MOCK_SESSIONS));

    }, [dateRange]); // Rerun only when the range changes

    return (
        <motion.main /* ... */>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            Welcome back, {user?.fullName?.split(' ')[0] || 'Guest'}
                        </h1>
                        <p className="mt-1 text-md text-slate-500 dark:text-slate-400">
                            Here's your coding activity overview.
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto">
                        <DateRangePicker selectedRange={dateRange} onRangeChange={setDateRange} />
                        <Link to="/projects/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all">
                            <FiPlus className="w-4 h-4" />
                            <span>New Project</span>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* --- MAIN CONTENT --- */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard sessions={filteredData} title={"Hours Coded"} dataKey={'duration'} />
                            <StatCard sessions={filteredData} title={"Keystrokes"} dataKey={'keystrokes'} />
                            <StatCard sessions={filteredData} title={"Lines of Code"} dataKey={'linesAdded'} />
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Coding Activity Trend</h3>
                            </div>
                            <div className="p-4 h-96">
                                <ProductivityChart sessions={filteredData} />
                            </div>
                        </div>
                        <PerformanceSummary sessions={filteredData} />
                        <AiSuggestions />
                    </div>

                    {/* --- SIDEBAR --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <LiveSession />
                        <ActiveProjects />
                        <RecentActivity />
                        {/* We pass all the data to Milestones so it can calculate all-time bests */}
                        <Milestones allSessions={MOCK_SESSIONS} /> 
                    </div>
                </div>
            </div>
        </motion.main>
    );
}