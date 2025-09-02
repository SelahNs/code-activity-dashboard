// src/components/PerformanceSummary.jsx
import LanguagePieChart from './LanguagePieChart';
import { FiZap, FiTarget } from 'react-icons/fi';

export default function PerformanceSummary({ sessions = [] }) {
    const currentStreak = 12;
    const longestStreak = 45;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* --- THE FIX: A robust 3-column grid that prevents overlap --- */}
            <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Left Side: Streaks Summary (Takes 1 of 3 columns) */}
                <div className="md:col-span-1 p-6 flex flex-col justify-center gap-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Streaks & Goals</h3>
                    <div className="flex flex-col gap-6">
                        {/* Current Streak */}
                        <div className="flex items-center gap-4">
                            <FiZap className="w-8 h-8 text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                    {currentStreak}
                                    <span className="text-lg font-medium text-slate-500 dark:text-slate-400 ml-1">Days</span>
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Current Streak</p>
                            </div>
                        </div>
                        {/* Longest Streak */}
                        <div className="flex items-center gap-4">
                            <FiTarget className="w-8 h-8 text-slate-500 flex-shrink-0" />
                            <div>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                    {longestStreak}
                                    <span className="text-lg font-medium text-slate-500 dark:text-slate-400 ml-1">Days</span>
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Longest Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Language Chart (Takes 2 of 3 columns) */}
                <div className="md:col-span-2 p-6 flex flex-col min-h-[400px]">
                     <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4">Top Languages</h3>
                     {/* This container ensures the chart fits perfectly within its column */}
                     <div className="flex-grow flex items-center justify-center">
                        <LanguagePieChart sessions={sessions} />
                     </div>
                </div>
            </div>
        </div>
    );
}