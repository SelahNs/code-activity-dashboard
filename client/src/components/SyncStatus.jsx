import { FiCheckCircle } from 'react-icons/fi';

export default function SyncStatus() {
    // In the future, a `const { isConnected } = useSyncContext();` would go here
    const isConnected = true; // Placeholder

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-3">
                Sync Status
            </h3>
            {isConnected ? (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <FiCheckCircle className="w-6 h-6" />
                    <div>
                        <p className="font-semibold">VS Code Connected</p>
                        <p className="text-xs">All activity is syncing.</p>
                    </div>
                </div>
            ) : (
                {/* A placeholder for the 'disconnected' state */}
            )}
        </div>
    );
}