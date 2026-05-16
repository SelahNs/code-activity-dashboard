// src/components/LiveSession.jsx
import { useState, useEffect, useCallback } from 'react'
import { FiFolder, FiClock, FiCode, FiMoon } from 'react-icons/fi'
import { authApiFetch } from '../lib/api'

const LIVE_THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes

const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

export default function LiveSession() {
    const [lastActivity, setLastActivity] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [now, setNow] = useState(Date.now())

    const fetchLatest = useCallback(async () => {
        try {
            const data = await authApiFetch('/api/activities?limit=1')
            setLastActivity(data[0] || null)
        } catch (e) {
            console.error('LiveSession fetch failed:', e)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Fetch on mount, then every 60 seconds
    useEffect(() => {
        fetchLatest()
        const fetchInterval = setInterval(fetchLatest, 60000)
        return () => clearInterval(fetchInterval)
    }, [fetchLatest])

    // Tick every 30 seconds to keep "X min ago" fresh
    useEffect(() => {
        const tickInterval = setInterval(() => setNow(Date.now()), 30000)
        return () => clearInterval(tickInterval)
    }, [])

    const isLive = lastActivity &&
        (Date.now() - new Date(lastActivity.capturedAt).getTime()) < LIVE_THRESHOLD_MS

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-sm text-slate-400">Checking session...</p>
            </div>
        )
    }

    // No activity ever
    if (!lastActivity) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <span className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        No Session Yet
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Install the CodeDash VSCode extension to start tracking your coding sessions in real time.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                {isLive ? (
                    <>
                        <div className="relative flex items-center justify-center flex-shrink-0">
                            <span className="absolute w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                            <span className="relative w-3 h-3 bg-emerald-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                            Live Session
                        </h3>
                        <span className="ml-auto text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    </>
                ) : (
                    <>
                        <FiMoon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                            Last Session
                        </h3>
                        <span className="ml-auto text-xs text-slate-400">
                            {formatTimeAgo(lastActivity.capturedAt)}
                        </span>
                    </>
                )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                {lastActivity.project && (
                    <div className="flex items-center gap-3 text-sm">
                        <FiFolder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">Project</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate ml-auto">
                            {lastActivity.project}
                        </span>
                    </div>
                )}

                {lastActivity.language && (
                    <div className="flex items-center gap-3 text-sm">
                        <FiCode className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">Language</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 ml-auto">
                            {lastActivity.language}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                    <FiClock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {isLive ? 'Session' : 'Duration'}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 ml-auto">
                        {formatDuration(lastActivity.duration)}
                    </span>
                </div>

                {/* Offline nudge */}
                {!isLive && (
                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                        Open VSCode to start a new session
                    </p>
                )}
            </div>
        </div>
    )
}