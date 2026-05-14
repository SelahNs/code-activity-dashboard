import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../lib/api'

export default function ActiveProjects() {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await apiClient.getProjects()
                // only show active projects, max 4
                const active = data
                    .filter(p => p.status === 'active')
                    .slice(0, 4)
                setProjects(active)
            } catch (e) {
                console.error('Failed to fetch projects:', e)
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [])

    const formatHours = (seconds) => {
        if (!seconds) return '0h'
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        if (hours === 0) return `${mins}m`
        if (mins === 0) return `${hours}h`
        return `${hours}h ${mins}m`
    }

    if (isLoading) return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400">Loading projects...</p>
        </div>
    )

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <header className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Active Projects
                </h3>
                <Link to="/projects" className="text-sm font-medium text-blue-600 hover:underline">
                    View All
                </Link>
            </header>

            {projects.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No active projects yet.</p>
            ) : (
                <div className="space-y-4">
                    {projects.map(project => (
                        <Link
                            to={`/projects/${project.id}`}
                            key={project.id}
                            className="flex items-center justify-between group"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate">
                                    {project.title}
                                </p>
                                {project.github?.fullName && (
                                    <p className="text-xs text-slate-400 truncate">
                                        {project.github.fullName}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                {project.github?.language && (
                                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
                                        {project.github.language}
                                    </span>
                                )}
                                <span className="text-xs font-mono text-slate-400">
                                    {formatHours(project.totalSecondsCoded)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}