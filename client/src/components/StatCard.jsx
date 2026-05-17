export default function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
    const colors = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    }

    // Shorter values get bigger text, longer values get smaller
    const valueLength = String(value).length
    const valueSizeClass = valueLength <= 4
        ? 'text-2xl'
        : valueLength <= 8
        ? 'text-xl'
        : 'text-lg'

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">
                    {title}
                </p>
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className={`${valueSizeClass} font-bold text-slate-800 dark:text-slate-100 leading-none`}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-tight">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    )
}