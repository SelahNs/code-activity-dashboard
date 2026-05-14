import { useEffect, useState } from 'react'
import { FiGitCommit, FiExternalLink } from 'react-icons/fi'
import { authApiFetch } from '../lib/api'

export default function RecentActivity() {
    const [commits, setCommits] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await authApiFetch('/api/commits?limit=5')
                setCommits(data)
            } catch (e) {
                console.error('Failed to fetch commits:', e)
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [])

    const timeAgo = (dateString) => {
        const now = new Date()
        const date = new Date(dateString)
        const seconds = Math.floor((now - date) / 1000)

        if (seconds < 60) return 'just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    if (isLoading) return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400">Loading activity...</p>
        </div>
    )

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <header className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Recent Commits
                </h3>
            </header>

            {commits.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                    No commits yet. Connect GitHub to see your activity.
                </p>
            ) : (
                <div className="space-y-4">
                    {commits.map(commit => (
                        <div key={commit._id} className="flex gap-3">
                            <div className="pt-1 flex-shrink-0">
                                <FiGitCommit className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">
                                        {timeAgo(commit.timestamp)}
                                    </p>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <p className="text-xs text-slate-400 truncate">
                                        {commit.repo}
                                    </p>
                                    {commit.url && (
                                        <a
                                            href={commit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0"
                                        >
                                            <FiExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                   </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}