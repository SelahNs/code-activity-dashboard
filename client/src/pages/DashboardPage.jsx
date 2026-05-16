// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiClock, FiZap, FiTrendingUp, FiActivity, FiGitCommit, FiStar } from 'react-icons/fi'

import { authApiFetch, apiClient } from '../lib/api'
import StatCard from '../components/StatCard'
import ProductivityChart from '../components/ProductivityChart'
import LanguagePieChart from '../components/LanguagePieChart'
import LiveSession from '../components/LiveSession'
import ActiveProjects from '../components/ActiveProjects'
import RecentActivity from '../components/RecentActivity'
import ShippingHeatmap from '../components/ShippingHeatmap'
import DateRangePicker from '../components/DateRangePicker'
import useAuthStore from '../stores/useAuthStore'
import useUserStore from '../stores/useUserStore'
import socket from '../utils/socket'

const getRangeDates = (dateRange) => {
    const now = new Date()
    const to = now.toISOString()
    let from
    if (dateRange === 'This Week') {
        const d = new Date(); d.setDate(d.getDate() - 7); from = d.toISOString()
    } else if (dateRange === 'This Month') {
        const d = new Date(); d.setDate(d.getDate() - 30); from = d.toISOString()
    } else if (dateRange === 'Last 3 Months') {
        const d = new Date(); d.setDate(d.getDate() - 90); from = d.toISOString()
    } else if (dateRange === 'This Year') {
        const d = new Date(); d.setDate(d.getDate() - 365); from = d.toISOString()
    } else {
        from = null
    }
    return { from, to }
}

const formatHours = (seconds) => {
    if (!seconds) return '0h'
    const h = seconds / 3600
    return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`
}

const formatRatio = (ratio) => {
    if (ratio === null || ratio === undefined) return '—'
    return Math.round(ratio * 100) + '%'
}

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState('This Week')
    const [activities, setActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(true)
    const [githubStats, setGithubStats] = useState({ dailyActivity: {}, totals: {} })

    const user = useAuthStore((state) => state.user)
    const { userData, isLoading: userLoading, fetchUser } = useUserStore()

    const hasVSCodeData = userData?.stats?.totalSecondsCoded > 0
    const hasGitHubData = userData?.github?.username

    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true)
        try {
            const { from, to } = getRangeDates(dateRange)
            const params = new URLSearchParams()
            if (from) params.append('from', from)
            params.append('to', to)
            const data = await authApiFetch(`/api/activities?${params.toString()}`)
            setActivities(data.map(a => ({ ...a, date: a.capturedAt })))
        } catch (e) {
            console.error('Failed to fetch activities:', e)
            setActivities([])
        } finally {
            setActivitiesLoading(false)
        }
    }, [dateRange])

    const fetchGithubStats = useCallback(async () => {
        try {
            const data = await apiClient.getGithubStats()
            setGithubStats(data)
        } catch (e) {
            console.error('Failed to fetch github stats:', e)
        }
    }, [])

    useEffect(() => {
        fetchUser()
        fetchActivities()
        fetchGithubStats()
    }, [fetchActivities, fetchGithubStats])

    useEffect(() => {
        const handleSyncComplete = () => {
            fetchUser()
            fetchActivities()
            fetchGithubStats()
        }
        socket.on('sync:complete', handleSyncComplete)
        return () => socket.off('sync:complete', handleSyncComplete)
    }, [fetchActivities, fetchGithubStats])

    const stats = userData?.stats
    const getTypingProfile = (ratio) => {
    if (ratio === null || ratio === undefined) {
        return { value: '—', desc: 'Not enough data yet' }
    }
    
    const percentNum = Math.round(ratio * 100);
    
    // Using common professional phrases
    if (ratio >= 0.8) {
        return { value: `${percentNum}%`, desc: 'Mostly manual typing' }
    }
    if (ratio >= 0.4) {
        return { value: `${percentNum}%`, desc: 'Balanced AI & snippets' }
    }
    return { value: `${percentNum}% Manual`, desc: 'Heavy AI & snippets' }
}

    // Context-aware stat cards — graceful for both VSCode and GitHub-only users
    const buildStatCards = () => {
        const cards = []

        // Card 1 — Hours coded (VSCode) OR Total commits (GitHub only)
        if (hasVSCodeData) {
            cards.push({
                title: 'Hours Coded',
                value: userLoading ? '...' : formatHours(stats?.totalSecondsCoded),
                subtitle: 'All time',
                icon: <FiClock className="w-4 h-4" />,
                color: 'blue'
            })
        } else {
            cards.push({
                title: 'Total Commits',
                value: userLoading ? '...' : (githubStats.totals?.commits ?? 0).toLocaleString(),
                subtitle: 'All time',
                icon: <FiGitCommit className="w-4 h-4" />,
                color: 'blue'
            })
        }

        // Card 2 — Current streak (works for everyone)
        cards.push({
            title: 'Current Streak',
            value: userLoading ? '...' : `${stats?.currentStreak ?? 0}d`,
            subtitle: `Best: ${stats?.longestStreak ?? 0} days`,
            icon: <FiTrendingUp className="w-4 h-4" />,
            color: 'amber'
        })

        // Card 3 — Level/XP (works for everyone)
        cards.push({
            title: 'Level',
            value: userLoading ? '...' : `Lv ${stats?.level ?? 1}`,
            subtitle: `${stats?.xp ?? 0} XP`,
            icon: <FiZap className="w-4 h-4" />,
            color: 'purple'
        })

        // Card 4 — Coding style (VSCode) OR Stars (GitHub only)
        if (hasVSCodeData) {
            const profile = getTypingProfile(stats?.humanCyborgRatio)
            cards.push({
                title: 'Manual Code Generation', // Professional title
                value: userLoading ? '...' : profile.value, // e.g., "65% Manual"
                subtitle: "Manual typing" || profile.desc,                     // e.g., "Balanced with AI/snippets"
                icon: <FiActivity className="w-4 h-4" />,
                color: 'emerald'
            })
        } else {
            cards.push({
                title: 'GitHub Stars',
                value: userLoading ? '...' : (githubStats.totals?.stars ?? 0).toLocaleString(),
                subtitle: 'Across all repos',
                icon: <FiStar className="w-4 h-4" />,
                color: 'emerald'
            })
        }

        return cards
    }

    const statCards = buildStatCards()

    return (
        <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Email verification banner */}
                {user && !user.isVerified && (
                    <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                        <p>⚠️ Your email is not verified. Please check your inbox or request a new link.</p>
                        <Link to="/resend-verification" className="flex-shrink-0 font-semibold underline hover:text-yellow-600">
                            Resend link
                        </Link>
                    </div>
                )}

                {/* Header — clean, no Add Project button */}
                <header className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Welcome back, {user?.profile?.fullName?.split(' ')[0] || user?.username || 'there'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Context-aware stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map((card, i) => (
                                <StatCard key={i} {...card} />
                            ))}
                        </div>

                        {/* Coding Activity Chart — date range picker lives here */}
                        {hasVSCodeData ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                                        Coding Activity
                                    </h3>
                                    <DateRangePicker
                                        selectedRange={dateRange}
                                        onRangeChange={setDateRange}
                                    />
                                </div>
                                <div className="p-4 h-72">
                                    {activitiesLoading ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-sm text-slate-400">Loading...</p>
                                        </div>
                                    ) : (
                                        <ProductivityChart sessions={activities} dataKey="duration" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* GitHub-only users — nudge to install extension */
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                                    Coding Activity
                                </h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    Install the CodeDash VSCode extension to track your coding time, keystrokes, and session activity.
                                </p>
                                <a
                                    href="https://marketplace.visualstudio.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all"
                                >
                                    Install Extension
                                </a>
                            </div>
                        )}

                        {/* Shipping Heatmap — works for everyone */}
                        <ShippingHeatmap dailyActivity={githubStats.dailyActivity} />

                        {/* Language breakdown — works for everyone with GitHub */}

                        {/* AI Summary — coming soon placeholder */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                                    AI Insights
                                </h3>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                    Coming soon
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Get personalized insights about your coding patterns, productivity trends, and habits — powered by Claude.
                            </p>
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-2 space-y-6">
                        <LiveSession />
                       <LanguagePieChart languageMap={userData?.skills?.githubLanguages || {}} />
                        <ActiveProjects />
                        <RecentActivity />
                    </div>
                
                </div>
            </div>
        </motion.main>
    )
}