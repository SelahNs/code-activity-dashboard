// src/components/LiveSession.jsx
import { useState, useEffect } from 'react';
import { FiZap, FiFolder, FiFile, FiClock } from 'react-icons/fi';

export default function LiveSession() {
    const [seconds, setSeconds] = useState(0);

    // This simulates a live-ticking timer
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    // Helper to format the seconds into HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    
    // In a real VS Code extension, this data would come from the editor API
    const currentProject = "Code-Activity-Dashboard";
    const currentFile = "DashboardPage.jsx";

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                    <span className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="relative w-3 h-3 bg-emerald-500 rounded-full"></span>
                </div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Live Session Active</h3>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                    <FiFolder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">Project:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{currentProject}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <FiFile className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">File:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{currentFile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <FiClock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{formatTime(seconds)}</span>
                </div>
            </div>
        </div>
    );
}