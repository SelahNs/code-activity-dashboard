import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../lib/api'

export default function ActiveProjects() {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await apiClient.getProjects()
                console.log('projects from API:', data)
                // only show active projects, max 4
                const active = data
                    .filter(p => p.status === 'active')
                    .slice(0, 4)
                setProjects(active)
            } catch (e) {
                console.error('Failed to fetch projects:', e)
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [])

    if (error) return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400">Failed to load projects.</p>
        </div>
    )
    const getHealthColor = (lastCommit) => {
        if (!lastCommit) return 'bg-slate-300'
        const days = (Date.now() - new Date(lastCommit)) / (1000 * 60 * 60 * 24)
        if (days < 7) return 'bg-emerald-400'   // active this week
        if (days < 30) return 'bg-amber-400'     // active this month
        return 'bg-red-400'                       // going cold
    }
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
                                <div 
                                    title={`Last commit: ${project.github?.lastCommit ? new Date(project.github.lastCommit).toLocaleDateString() : 'unknown'}`}
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${getHealthColor(project.github?.lastCommit)}`} 
                                />
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