// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FiClock, FiZap, FiTrendingUp, FiActivity,
    FiGitCommit, FiStar, FiCheck, FiCode, FiPackage
} from 'react-icons/fi'

import { authApiFetch, apiClient } from '../lib/api'
import StatCard from '../components/StatCard'
import ProductivityChart from '../components/ProductivityChart'
import LanguagePieChart from '../components/LanguagePieChart'
import LiveSession from '../components/LiveSession'
import ActiveProjects from '../components/ActiveProjects'
import RecentActivity from '../components/RecentActivity'
import ShippingHeatmap from '../components/ShippingHeatmap'
import DateRangePicker from '../components/DateRangePicker'
import DeveloperSummary from '../components/DeveloperSummary'
import useAuthStore from '../stores/useAuthStore'
import useUserStore from '../stores/useUserStore'
import socket from '../utils/socket'

const getRangeDates = (dateRange) => {
    const now = new Date()
    const to = now.toISOString()
    let from

    if (dateRange === 'This Week') {
        const day = now.getDay() // 0=Sun, 1=Mon...
        const monday = new Date(now)
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
        monday.setHours(0, 0, 0, 0)
        from = monday.toISOString()
    } else if (dateRange === 'This Month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1)
        from = first.toISOString()
    } else if (dateRange === 'Last 3 Months') {
        const d = new Date(now)
        d.setMonth(d.getMonth() - 3)
        from = d.toISOString()
    } else if (dateRange === 'This Year') {
        const first = new Date(now.getFullYear(), 0, 1)
        from = first.toISOString()
    } else {
        from = null
    }
    return { from, to }
}

    const getPreviousRange = (dateRange, from, to) => {
    if (dateRange === 'This Week') {
        const prevFrom = new Date(from)
        prevFrom.setDate(prevFrom.getDate() - 7)
        const prevTo = new Date(to)
        prevTo.setDate(prevTo.getDate() - 7)
        return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() }
    }
    if (dateRange === 'This Month') {
        const prevFrom = new Date(from)
        prevFrom.setMonth(prevFrom.getMonth() - 1)
        const prevTo = new Date(to)
        prevTo.setMonth(prevTo.getMonth() - 1)
        return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() }
    }
    if (dateRange === 'Last 3 Months') {
        const prevFrom = new Date(from)
        prevFrom.setMonth(prevFrom.getMonth() - 3)
        const prevTo = new Date(to)
        prevTo.setMonth(prevTo.getMonth() - 3)
        return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() }
    }
    if (dateRange === 'This Year') {
        const prevFrom = new Date(from)
        prevFrom.setFullYear(prevFrom.getFullYear() - 1)
        const prevTo = new Date(to)
        prevTo.setFullYear(prevTo.getFullYear() - 1)
        return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() }
    }
    return { prevFrom: null, prevTo: null }
}

const formatHours = (seconds) => {
    if (!seconds) return '0h'
    const h = seconds / 3600
    return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`
}

// Style label first, percentage in subtitle
const getCodingStyle = (ratio) => {
    if (ratio === null || ratio === undefined) return { value: '—', desc: 'No data yet' }
    const pct = Math.round(ratio * 100)
    if (ratio >= 0.8) return { value: `${pct}% Manual`, desc: 'Deep typing style' }
    if (ratio >= 0.5) return { value: `${pct}% Manual`, desc: 'Balanced workflow' }
    if (ratio >= 0.25) return { value: `${pct}% Manual`, desc: 'AI-augmented' }
    return { value: `${pct}% Manual`, desc: 'Vibe coding' }
}

// Frameworks placeholder card
const FrameworksCard = ({ frameworks }) => {
    const hasFrameworks = frameworks && Object.keys(frameworks).length > 0
    const topFrameworks = hasFrameworks
        ? Object.entries(frameworks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
        : []

    const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#64748B']

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        Frameworks
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Detected from your projects
                    </p>
                </div>
                {!hasFrameworks && (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        Coming soon
                    </span>
                )}
            </div>

            {hasFrameworks ? (
                <div className="flex flex-col gap-2">
                    {topFrameworks.map(([name], i) => (
                        <div key={name} className="flex items-center gap-2.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
                    <FiPackage className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Framework detection is coming with the next extension update. React, Next.js, Django and more will appear here automatically.
                    </p>
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState('This Week')
    const [activities, setActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(true)
    const [previousActivities, setPreviousActivities] = useState([])
    const [githubStats, setGithubStats] = useState({ dailyActivity: {}, totals: {} })

    const user = useAuthStore((state) => state.user)
    const { userData, isLoading: userLoading, fetchUser } = useUserStore()

    const hasVSCodeData = (userData?.stats?.totalSecondsCoded ?? 0) > 0
    const hasGitHubData = !!(userData?.github?.username || userData?.github?.id)

    const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true)
    try {
        const { from, to } = getRangeDates(dateRange)
        const { prevFrom, prevTo } = getPreviousRange(dateRange, from, to)

        const currentParams = new URLSearchParams()
        if (from) currentParams.append('from', from)
        currentParams.append('to', to)

        const prevParams = new URLSearchParams()
        if (prevFrom) prevParams.append('from', prevFrom)
        if (prevTo) prevParams.append('to', prevTo)

        const [currentData, prevData] = await Promise.all([
            authApiFetch(`/api/activities?${currentParams.toString()}`),
            prevFrom ? authApiFetch(`/api/activities?${prevParams.toString()}`) : Promise.resolve([])
        ])

        setActivities(currentData.map(a => ({ ...a, date: a.capturedAt })))
        setPreviousActivities(prevData.map(a => ({ ...a, date: a.capturedAt })))
    } catch (e) {
        console.error('Failed to fetch activities:', e)
        setActivities([])
        setPreviousActivities([])
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

    const buildStatCards = () => {
        const cards = []

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
                title: 'Commits',
                value: userLoading ? '...' : (githubStats.totals?.commits ?? 0).toLocaleString(),
                subtitle: 'All time',
                icon: <FiGitCommit className="w-4 h-4" />,
                color: 'blue'
            })
        }

        cards.push({
            title: 'Streak',
            value: userLoading ? '...' : `${stats?.currentStreak ?? 0}d`,
            subtitle: `Best: ${stats?.longestStreak ?? 0} days`,
            icon: <FiTrendingUp className="w-4 h-4" />,
            color: 'amber'
        })

        cards.push({
            title: 'Level',
            value: userLoading ? '...' : `Lv ${stats?.level ?? 1}`,
            subtitle: `${(stats?.xp ?? 0).toLocaleString()} XP`,
            icon: <FiZap className="w-4 h-4" />,
            color: 'purple'
        })

        if (hasVSCodeData) {
            const style = getCodingStyle(stats?.humanCyborgRatio)
            cards.push({
                title: 'Code Style',
                value: userLoading ? '...' : style.value,
                subtitle: style.desc,
                icon: <FiActivity className="w-4 h-4" />,
                color: 'emerald'
            })
        } else {
            cards.push({
                title: 'Stars',
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

                {user && !user.isVerified && (
                    <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                        <p>⚠️ Your email is not verified. Please check your inbox or request a new link.</p>
                        <Link to="/resend-verification" className="flex-shrink-0 font-semibold underline hover:text-yellow-600">
                            Resend link
                        </Link>
                    </div>
                )}

                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                Welcome back, {user?.profile?.fullName?.split(' ')[0] || user?.username || 'there'}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pb-1">
                            {hasGitHubData && (
                                <span className="flex items-center gap-1">
                                    <FiCheck className="w-3 h-3 text-emerald-500" />
                                    GitHub
                                </span>
                            )}
                            {hasVSCodeData && (
                                <span className="flex items-center gap-1">
                                    <FiCheck className="w-3 h-3 text-emerald-500" />
                                    Extension
                                </span>
                            )}
                            {!hasGitHubData && !hasVSCodeData && (
                                <Link to="/settings" className="text-blue-500 hover:underline">
                                    Connect integrations →
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-3 space-y-6">

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                            {statCards.map((card, i) => (
                                <StatCard key={i} {...card} />
                            ))}
                        </div>

                        {hasVSCodeData ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                        Coding Activity
                                    </h3>
                                    <DateRangePicker
                                        selectedRange={dateRange}
                                        onRangeChange={setDateRange}
                                    />
                                </div>
                                <div className="p-4 h-64">
                                    {activitiesLoading ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-sm text-slate-400">Loading...</p>
                                        </div>
                                    ) : (
                                        <ProductivityChart
                                            sessions={activities}
                                            previousSessions={previousActivities}
                                            dataKey="duration"
                                            dateRange={dateRange}   // ADD THIS
                                        />                                   )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                        <FiCode className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                                            Unlock Coding Activity
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-3">
                                            Install the CodeDash extension to track your coding time, keystrokes, and style fingerprint — works in VSCode and more editors coming soon.
                                        </p>
                                        <a
                                            href="https://marketplace.visualstudio.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all"
                                        >
                                            Install Extension →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LanguagePieChart
                                languageMap={userData?.skills?.githubLanguages || {}}
                            />
                            <FrameworksCard
                                frameworks={userData?.skills?.frameworks || {}}
                            />
                        </div>
                        <ShippingHeatmap dailyActivity={githubStats.dailyActivity} />
                        
                        
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-2 space-y-6">
                        <LiveSession />
                        <ActiveProjects />
                        <RecentActivity />
                        <DeveloperSummary
                            userData={userData}
                            githubStats={githubStats}
                        />
                    </div>
                </div>
            </div>
        </motion.main>
    )
}