// This is a conceptual example of our new component
import { FiZap, FiTarget } from 'react-icons/fi';

export default function GoalsAndStreaks({ sessions = [] }) {
    // In a real app, these values would come from user settings and data
    const dailyGoal = 120; // minutes
    const currentProgress = sessions.reduce((sum, s) => sum + s.duration, 0);
    const currentStreak = 12; // days
    const longestStreak = 45; // days

    return (
        <div className="p-6 h-full">
            <h3 className="font-semibold text-lg mb-4">Goals & Streaks</h3>
            <div className="space-y-6">
                {/* Daily Goal Progress */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="font-medium text-sm text-slate-600 dark:text-slate-300">Daily Goal</span>
                        <span className="font-mono text-sm text-slate-500">{`${(currentProgress / 60).toFixed(1)} / ${(dailyGoal / 60)}h`}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((currentProgress / dailyGoal) * 100, 100)}%` }}></div>
                    </div>
                </div>

                {/* Streaks */}
                <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                        <FiZap className="w-6 h-6 text-amber-500" />
                        <div>
                            <p className="text-xl font-bold">{currentStreak}</p>
                            <p className="text-xs text-slate-500">Current Streak</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FiTarget className="w-6 h-6 text-slate-500" />
                        <div>
                            <p className="text-xl font-bold">{longestStreak}</p>
                            <p className="text-xs text-slate-500">Longest Streak</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}