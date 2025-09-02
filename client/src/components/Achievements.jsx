// src/components/Achievements.jsx
import { FiZap, FiMoon, FiSunrise } from 'react-icons/fi';

export default function Achievements() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4">
                Streaks & Achievements
            </h3>
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <FiZap className="w-5 h-5 text-yellow-500" />
                    <div>
                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">5-Day Coding Streak</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Keep it going!</p>
                    </div>
                </div>
                {/* Add more achievements */}
            </div>
        </div>
    );
}