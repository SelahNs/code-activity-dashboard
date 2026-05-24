import ThemeToggle from './ThemeToggle'

export default function AppearanceSettings() {
    return (
        <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Appearance</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Customize the look and feel of your dashboard.</p>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg">
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</p>
                    <p className="text-xs text-slate-400">Select your preferred color scheme.</p>
                </div>
                <ThemeToggle />
            </div>
        </div>
    )
}