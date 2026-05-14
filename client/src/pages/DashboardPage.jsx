// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiPlus, FiClock, FiZap, FiTrendingUp, FiCpu } from 'react-icons/fi'

import StatCard from '../components/StatCard'
import ProductivityChart from '../components/ProductivityChart'
import LanguagePieChart from '../components/LanguagePieChart'
import LiveSession from '../components/LiveSession'
import ActiveProjects from '../components/ActiveProjects'
import RecentActivity from '../components/RecentActivity'
import AiSuggestions from '../components/AiSuggestions'
import Milestones from '../components/Milestones'
import DateRangePicker from '../components/DateRangePicker'

import useAuthStore from '../stores/useAuthStore'
import useUserStore from '../stores/useUserStore'
import { authApiFetch } from '../lib/api'
import socket from '../utils/socket'

// --- Helpers ---

// Converts a dateRange label to { from, to } Date objects
const getRangeDates = (dateRange) => {
    const now = new Date()
    const to = now.toISOString()
    let from

    if (dateRange === 'This Week') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        from = d.toISOString()
    } else if (dateRange === 'This Month') {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        from = d.toISOString()
    } else {
        // All Time — no from filter needed, send empty string
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

// ---

export default function DashboardPage() {
    const [dateRange, setDateRange] = useState('This Week')
    const [activities, setActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(true)

    const user = useAuthStore((state) => state.user)
    const { userData, isLoading: userLoading, fetchUser } = useUserStore()

    // Fetch activities whenever the date range changes
    const fetchActivities = useCallback(async () => {
        setActivitiesLoading(true)
        try {
            const { from, to } = getRangeDates(dateRange)
            const params = new URLSearchParams()
            if (from) params.append('from', from)
            params.append('to', to)
            const data = await authApiFetch(`/api/activities?${params.toString()}`)
            // Map capturedAt → date so ProductivityChart works without changes
            setActivities(data.map(a => ({ ...a, date: a.capturedAt })))
        } catch (e) {
            console.error('Failed to fetch activities:', e)
            setActivities([])
        } finally {
            setActivitiesLoading(false)
        }
    }, [dateRange])

    useEffect(() => {
        fetchUser()
        fetchActivities()
    }, [fetchActivities])

    // When GitHub sync completes, refresh both user stats and activities
    useEffect(() => {
        const handleSyncComplete = () => {
            fetchUser()
            fetchActivities()
        }
        socket.on('sync:complete', handleSyncComplete)
        return () => socket.off('sync:complete', handleSyncComplete)
    }, [fetchActivities])

    const stats = userData?.stats

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
                        <Link
                            to="/resend-verification"
                            className="flex-shrink-0 font-semibold underline hover:text-yellow-600"
                        >
                            Resend link
                        </Link>
                    </div>
                )}

                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            Welcome, {user?.profile?.fullName?.split(' ')[0] || user?.username || 'Guest'}
                        </h1>
                        <p className="mt-1 text-md text-slate-500 dark:text-slate-400">
                            Here's your coding activity overview.
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto">
                        <DateRangePicker selectedRange={dateRange} onRangeChange={setDateRange} />
                        <Link
                            to="/projects/new"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 transition-all"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>New Project</span>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Stat Cards — all-time totals from userData */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Hours Coded"
                                value={userLoading ? '...' : formatHours(stats?.totalSecondsCoded)}
                                subtitle="All time"
                                icon={<FiClock className="w-4 h-4" />}
                                color="blue"
                            />
                            <StatCard
                                title="Current Streak"
                                value={userLoading ? '...' : `${stats?.currentStreak ?? 0}d`}
                                subtitle={`Best: ${stats?.longestStreak ?? 0} days`}
                                icon={<FiTrendingUp className="w-4 h-4" />}
                                color="amber"
                            />
                            <StatCard
                                title="Level"
                                value={userLoading ? '...' : `Lv ${stats?.level ?? 1}`}
                                subtitle={`${stats?.xp ?? 0} XP`}
                                icon={<FiZap className="w-4 h-4" />}
                                color="purple"
                            />
                            <StatCard
                                title="Human Ratio"
                                value={userLoading ? '...' : formatRatio(stats?.humanCyborgRatio)}
                                subtitle="Keystrokes vs AI"
                                icon={<FiCpu className="w-4 h-4" />}
                                color="emerald"
                            />
                        </div>

                        {/* Activity Chart — filtered by date range */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                                    Coding Activity
                                </h3>
                            </div>
                            <div className="p-4 h-72">
                                {activitiesLoading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p className="text-sm text-slate-400">Loading chart...</p>
                                    </div>
                                ) : (
                                    <ProductivityChart sessions={activities} dataKey="duration" />
                                )}
                            </div>
                        </div>

                        <LanguagePieChart languageMap={userData?.skills?.languages || {}} />
                        <AiSuggestions />
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-2 space-y-6">
                        <LiveSession />
                        <ActiveProjects />
                        <RecentActivity />
                        <Milestones allSessions={[]} />
                    </div>
                </div>
            </div>
        </motion.main>
    )
}