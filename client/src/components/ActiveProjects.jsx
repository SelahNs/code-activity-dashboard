// src/components/ActiveProjects.jsx

import { Link } from 'react-router-dom';

// We can define the mock data right here for now.
// In the future, this component will receive this data as a prop.
const mockActiveProjects = [
    {
        id: 'proj1',
        title: 'Code Activity Dashboard',
        progress: 75,
    },
    {
        id: 'proj2',
        title: 'AI Note Taking App',
        progress: 30,
    },
    {
        id: 'proj3',
        title: 'E-Commerce Storefront',
        progress: 100,
    }
];

export default function ActiveProjects() {
    return (
        // The main widget card
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            {/* The widget header */}
            <header className='flex justify-between items-center mb-4'>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Active Projects
                </h3>
                <Link to='/projects' className="text-sm font-medium text-blue-600 hover:underline">
                    View All
                </Link>
            </header>
            
            {/* The list of project rows */}
            <div className="space-y-5">
                {mockActiveProjects.map(project => (
                    // A Link wrapper to make the entire row clickable
                    <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </p>
                            <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                {project.progress}%
                            </p>
                        </div>
                        {/* The Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}