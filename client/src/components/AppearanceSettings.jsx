import ThemeToggle from "./ThemeToggle";

export default function AppearanceSettings() {
    return (
        <section className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Appearance</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Customize the look and feel of your dashboard.</p>

            <div className="mt-6 flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Theme</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred color scheme.</p>
                </div>
                {/* HERE IS THE TOGGLE'S NEW HOME */}
                <ThemeToggle />
            </div>

        </section>
    );
}