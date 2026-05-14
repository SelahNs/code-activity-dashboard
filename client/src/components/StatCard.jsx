// src/components/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
    const colors = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
        </div>
    )
}