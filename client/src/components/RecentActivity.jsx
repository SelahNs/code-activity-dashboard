// src/components/RecentActivity.jsx
import { useEffect, useState } from 'react'
import { FiGitCommit, FiExternalLink, FiGithub } from 'react-icons/fi'
import { authApiFetch } from '../lib/api'

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
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentActivity() {
    const [commits, setCommits] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                const data = await authApiFetch('/api/commits?limit=6')
                setCommits(data)
            } catch (e) {
                console.error('Failed to fetch commits:', e)
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCommits()
    }, [])

    if (isLoading) return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col">
            <header className="flex justify-between items-center p-6 pb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Recent Commits
                </h3>
                {commits.length > 0 && (
                    <span className="text-xs text-slate-400">
                        {commits.length} shown
                    </span>
                )}
            </header>

            <div className="flex-1 px-6 pb-6">
                {error ? (
                    <p className="text-sm text-slate-400">Failed to load commits.</p>
                ) : commits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                        <FiGithub className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            No commits yet. Connect GitHub to see your activity here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {commits.map((commit, i) => (
                            <div
                                key={commit._id}
                                className="flex gap-3 group"
                            >
                                {/* Timeline dot */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 group-hover:bg-blue-500 transition-colors" />
                                    {i < commits.length - 1 && (
                                        <div className="w-px flex-1 bg-slate-100 dark:bg-slate-700 mt-1" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 pb-1">
                                    <p className="text-sm text-slate-700 dark:text-slate-200 truncate leading-snug">
                                        {commit.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs text-slate-400">
                                            {timeAgo(commit.timestamp)}
                                        </span>
                                        <span className="text-slate-200 dark:text-slate-700">·</span>
                                        <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                            {commit.repo?.split('/').pop() || commit.repo}
                                        </span>
                                        {commit.additions > 0 && (
                                            <>
                                                <span className="text-slate-200 dark:text-slate-700">·</span>
                                                <span className="text-xs text-emerald-500">
                                                    +{commit.additions}
                                                </span>
                                                {commit.deletions > 0 && (
                                                    <span className="text-xs text-red-400">
                                                        -{commit.deletions}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                        {commit.url && (
                                            <a
                                                href={commit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors flex-shrink-0 ml-auto"
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
        </div>
    )
}