// src/components/RecentActivity.jsx
import { Link } from 'react-router-dom';
import { FiGitCommit, FiCheckSquare, FiFileText } from 'react-icons/fi';

// Mock data to make it feel real
const mockActivity = [
    { type: 'commit', text: 'Refactored the authentication flow', time: '2h ago', project: 'CodeDash' },
    { type: 'task', text: 'Completed UI for Projects page', time: '8h ago', project: 'CodeDash' },
    { type: 'note', text: 'Added new idea for focus timer', time: '1d ago', project: 'General' },
    { type: 'commit', text: 'Initial commit for AI Note App', time: '3d ago', project: 'AI Note App' },
];

const activityIcons = {
    commit: <FiGitCommit className="w-4 h-4 text-slate-400" />,
    task: <FiCheckSquare className="w-4 h-4 text-slate-400" />,
    note: <FiFileText className="w-4 h-4 text-slate-400" />,
};

export default function RecentActivity() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <header className='flex justify-between items-center mb-4'>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Recent Activity
                </h3>
                <Link to='/activity' className="text-sm font-medium text-blue-600 hover:underline">
                    View All
                </Link>
            </header>
            <div className="space-y-4">
                {mockActivity.map((item, index) => (
                    <div key={index} className="flex gap-3">
                        <div className="pt-1">{activityIcons[item.type]}</div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{item.time} on <span className="font-medium text-slate-500 dark:text-slate-400">{item.project}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
