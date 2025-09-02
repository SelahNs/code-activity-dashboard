// src/components/Milestones.jsx
import { FiAward, FiZap, FiCode } from 'react-icons/fi';

// A simple helper component for each milestone item
const MilestoneItem = ({ icon, title, value, unit }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{value}</span> {unit}
                </p>
            </div>
        </div>
    );
};

export default function Milestones({ allSessions = [] }) {
    // In a real app, you'd calculate these from the entire user history,
    // but for now, we'll calculate from the data we have.
    const longestSession = allSessions.reduce((max, s) => s.duration > max ? s.duration : max, 0);
    const mostLines = allSessions.reduce((max, s) => s.linesAdded > max ? s.linesAdded : max, 0);
    const mostProductiveDay = "Oct 26, 2023"; // Dummy data for display

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Personal Bests</h3>
            </div>
            <div className="p-6 space-y-5">
                <MilestoneItem
                    icon={<FiAward className="w-5 h-5 text-amber-500" />}
                    title="Most Productive Day"
                    value={mostProductiveDay}
                    unit=""
                />
                <MilestoneItem
                    icon={<FiZap className="w-5 h-5 text-blue-500" />}
                    title="Longest Session"
                    value={`${(longestSession / 60).toFixed(1)}`}
                    unit="hours"
                />
                <MilestoneItem
                    icon={<FiCode className="w-5 h-5 text-emerald-500" />}
                    title="Most Lines in a Day"
                    value={mostLines.toLocaleString()}
                    unit="lines"
                />
            </div>
        </div>
    );
}