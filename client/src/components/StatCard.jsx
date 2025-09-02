// A more polished StatCard with hover effects
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export default function StatCard({ sessions, title, dataKey }) {
    const total = sessions.reduce((sum, s) => sum + s[dataKey], 0);
    const trend = Math.random() > 0.5 ? 'up' : 'down'; // Dummy trend data

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                {trend === 'up' ? <FiArrowUpRight className="text-green-500" /> : <FiArrowDownRight className="text-red-500" />}
            </div>
            <p className="text-3xl font-bold mt-2 text-slate-800 dark:text-slate-100">
                {total.toLocaleString()}
            </p>
        </div>
    );
}
