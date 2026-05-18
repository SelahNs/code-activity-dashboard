import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    FiZap, FiTrendingUp, FiClock, FiGitCommit,
    FiCode, FiStar, FiCalendar, FiActivity
} from 'react-icons/fi'
import { apiClient } from '../lib/api'
import useUserStore from '../stores/useUserStore'

const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#10B981']

const formatHours = (hours) => {
    if (!hours) return '0h'
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`
}

const formatSeconds = (seconds) => {
    if (!seconds) return '0h'
    return formatHours(seconds / 3600)
}

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })
}

// ================================================================
// BEST CARD
// ================================================================
const BestCard = ({ icon, label, value, sub, color = 'indigo', delay = 0 }) => {
    const colorMap = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
        >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${colorMap[color]}`}>
                {icon}
            </div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {value}
            </p>
            {sub && (
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
            )}
        </motion.div>
    )
}

// ================================================================
// SECTION WRAPPER
// ================================================================
const Section = ({ title, subtitle, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
    >
        <div className="mb-5">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {children}
    </motion.div>
)

// ================================================================
// CUSTOM TOOLTIP
// ================================================================
const ChartTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {formatter ? formatter(p.value) : p.value}
                </p>
            ))}
        </div>
    )
}

// ================================================================
// CODING RHYTHM HEATMAP
// ================================================================
const RhythmHeatmap = ({ grid, days }) => {
    if (!grid || !days) return null

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const maxVal = Math.max(...days.flatMap(d => hours.map(h => grid[d]?.[h] || 0)))

    const getColor = (val) => {
        if (!val || maxVal === 0) return 'bg-slate-100 dark:bg-slate-700'
        const intensity = val / maxVal
        if (intensity < 0.2) return 'bg-indigo-100 dark:bg-indigo-900/30'
        if (intensity < 0.4) return 'bg-indigo-200 dark:bg-indigo-800/50'
        if (intensity < 0.6) return 'bg-indigo-400 dark:bg-indigo-600'
        if (intensity < 0.8) return 'bg-indigo-500 dark:bg-indigo-500'
        return 'bg-indigo-600 dark:bg-indigo-400'
    }

    const formatHour = (h) => {
        if (h === 0) return '12a'
        if (h === 12) return '12p'
        return h < 12 ? `${h}a` : `${h - 12}p`
    }

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[600px]">
                {/* Hour labels */}
                <div className="flex mb-1 ml-10">
                    {hours.filter(h => h % 3 === 0).map(h => (
                        <div
                            key={h}
                            className="text-xs text-slate-400"
                            style={{ width: `${100 / 8}%` }}
                        >
                            {formatHour(h)}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                {days.map(day => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-slate-400 w-8 flex-shrink-0">{day}</span>
                        <div className="flex gap-0.5 flex-1">
                            {hours.map(h => {
                                const val = grid[day]?.[h] || 0
                                return (
                                    <div
                                        key={h}
                                        title={val > 0 ? `${formatHours(val)} on ${day} at ${formatHour(h)}` : ''}
                                        className={`flex-1 h-5 rounded-sm transition-colors cursor-default ${getColor(val)}`}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-xs text-slate-400">Less</span>
                    {['bg-slate-100 dark:bg-slate-700', 'bg-indigo-100 dark:bg-indigo-900/30', 'bg-indigo-200 dark:bg-indigo-800/50', 'bg-indigo-400', 'bg-indigo-600'].map((c, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
                    ))}
                    <span className="text-xs text-slate-400">More</span>
                </div>
            </div>
        </div>
    )
}

// ================================================================
// TIME OF DAY BAR
// ================================================================
const TimeOfDayBar = ({ breakdown }) => {
    if (!breakdown) return null
    const total = breakdown.reduce((s, t) => s + t.seconds, 0)
    const max = Math.max(...breakdown.map(t => t.seconds))

    return (
        <div className="flex flex-col gap-3">
            {breakdown.map((slot, i) => {
                const pct = total > 0 ? (slot.seconds / total) * 100 : 0
                const isTop = slot.seconds === max
                return (
                    <div key={slot.label} className="flex items-center gap-3">
                        <span className="text-base w-6">{slot.emoji}</span>
                        <span className={`text-sm w-24 flex-shrink-0 ${
                            isTop
                                ? 'font-semibold text-slate-800 dark:text-slate-100'
                                : 'text-slate-500 dark:text-slate-400'
                        }`}>
                            {slot.label}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="h-full rounded-full bg-indigo-500"
                            />
                        </div>
                        <span className="text-xs text-slate-400 w-12 text-right flex-shrink-0">
                            {formatSeconds(slot.seconds)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ================================================================
// MILESTONES
// ================================================================
const Milestones = ({ bests, userData }) => {
    const totalHours = (userData?.stats?.totalSecondsCoded || 0) / 3600
    const milestones = [
        { label: 'First commit', value: formatDate(bests?.firstCommit?.timestamp), icon: '🎯' },
        { label: 'Total hours coded', value: `${Math.round(totalHours)}h`, icon: '⏱️' },
        { label: 'Total commits', value: (bests?.bestDayByCommits ? 'See bests' : '—'), icon: '📦' },
        { label: 'Longest coding streak', value: `${bests?.longestCodingStreak || 0} days`, icon: '🔥' },
        { label: 'Longest commit streak', value: `${bests?.longestCommitStreak || 0} days`, icon: '⚡' },
        { label: 'Total days coded', value: `${bests?.totalDaysCoded || 0} days`, icon: '📅' },
        { label: 'Favorite time', value: bests?.favoriteTimeOfDay?.label || '—', icon: bests?.favoriteTimeOfDay?.emoji || '⏰' },
        { label: 'Most prolific repo', value: bests?.mostProlificRepo?._id?.split('/').pop() || '—', icon: '🏆' },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m, i) => (
                <motion.div
                    key={m.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl gap-2"
                >
                    <span className="text-2xl">{m.icon}</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {m.value}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight">{m.label}</p>
                </motion.div>
            ))}
        </div>
    )
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function InsightsPage() {
    const [bests, setBests] = useState(null)
    const [weeklyTrend, setWeeklyTrend] = useState([])
    const [languageTrend, setLanguageTrend] = useState({ months: [], topLanguages: [] })
    const [codingRhythm, setCodingRhythm] = useState({ grid: null, days: [] })
    const [loading, setLoading] = useState(true)

    const { userData, fetchUser } = useUserStore()

    useEffect(() => {
        fetchUser()
        const fetchAll = async () => {
            try {
                const [bestsData, trendData, langData, rhythmData] = await Promise.all([
                    apiClient.getBests(),
                    apiClient.getWeeklyTrend(),
                    apiClient.getLanguageTrend(),
                    apiClient.getCodingRhythm(),
                ])
                setBests(bestsData)
                setWeeklyTrend(trendData.weeks || [])
                setLanguageTrend(langData)
                setCodingRhythm(rhythmData)
            } catch (e) {
                console.error('Failed to fetch insights:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
            </div>
        )
    }

    const hasExtensionData = (userData?.stats?.totalSecondsCoded || 0) > 0
    const hasGitHubData = !!(userData?.github?.username || userData?.github?.id)

    return (
        <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Insights
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Your full coding story — trends, bests, and patterns over time.
                    </p>
                </header>

                {/* ── PERSONAL BESTS ROW ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {hasExtensionData && (
                        <>
                            <BestCard
                                icon={<FiClock className="w-4 h-4" />}
                                label="Best day — hours coded"
                                value={formatSeconds(bests?.bestDayByHours?.totalSeconds)}
                                sub={formatDate(bests?.bestDayByHours?._id)}
                                color="indigo"
                                delay={0.05}
                            />
                            <BestCard
                                icon={<FiTrendingUp className="w-4 h-4" />}
                                label="Best week — hours coded"
                                value={formatSeconds(bests?.bestWeekByHours?.totalSeconds)}
                                sub={bests?.bestWeekByHours?.firstDay
                                    ? `Week of ${formatDate(bests.bestWeekByHours.firstDay)}`
                                    : '—'}
                                color="purple"
                                delay={0.1}
                            />
                            <BestCard
                                icon={<FiZap className="w-4 h-4" />}
                                label="Longest session"
                                value={formatSeconds(bests?.longestSession?.duration)}
                                sub={formatDate(bests?.longestSession?.capturedAt)}
                                color="amber"
                                delay={0.15}
                            />
                            <BestCard
                                icon={<FiActivity className="w-4 h-4" />}
                                label="Most keystrokes — day"
                                value={(bests?.mostKeystrokesDay?.totalKeystrokes || 0).toLocaleString()}
                                sub={formatDate(bests?.mostKeystrokesDay?._id)}
                                color="emerald"
                                delay={0.2}
                            />
                        </>
                    )}
                    {hasGitHubData && (
                        <>
                            <BestCard
                                icon={<FiGitCommit className="w-4 h-4" />}
                                label="Best day — commits"
                                value={`${bests?.bestDayByCommits?.count || 0} commits`}
                                sub={formatDate(bests?.bestDayByCommits?._id)}
                                color="blue"
                                delay={0.25}
                            />
                            <BestCard
                                icon={<FiGitCommit className="w-4 h-4" />}
                                label="Best week — commits"
                                value={`${bests?.bestWeekByCommits?.count || 0} commits`}
                                sub={bests?.bestWeekByCommits?.firstDay
                                    ? `Week of ${formatDate(bests.bestWeekByCommits.firstDay)}`
                                    : '—'}
                                color="indigo"
                                delay={0.3}
                            />
                            <BestCard
                                icon={<FiStar className="w-4 h-4" />}
                                label="Most prolific repo"
                                value={bests?.mostProlificRepo?._id?.split('/').pop() || '—'}
                                sub={`${bests?.mostProlificRepo?.count || 0} commits`}
                                color="rose"
                                delay={0.35}
                            />
                            <BestCard
                                icon={<FiCalendar className="w-4 h-4" />}
                                label="Coding since"
                                value={bests?.firstCommit
                                    ? new Date(bests.firstCommit.timestamp)
                                        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                    : '—'}
                                sub="First commit on GitHub"
                                color="emerald"
                                delay={0.4}
                            />
                        </>
                    )}
                </div>

                {/* ── WEEKLY TREND ── */}
                {weeklyTrend.length > 0 && (
                    <Section
                        title="Weekly trend"
                        subtitle="Hours coded and commits per week over the last year"
                        delay={0.2}
                    >
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="commitsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        interval="preserveStartEnd"
                                        dy={8}
                                    />
                                    <YAxis
                                        yAxisId="hours"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        tickFormatter={v => `${v}h`}
                                        width={35}
                                    />
                                    <YAxis
                                        yAxisId="commits"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        width={30}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => (
                                            <ChartTooltip
                                                active={active}
                                                payload={payload}
                                                label={label}
                                                formatter={(v, name) =>
                                                    name === 'Hours' ? formatHours(v) : `${v} commits`
                                                }
                                            />
                                        )}
                                    />
                                    {hasExtensionData && (
                                        <Area
                                            yAxisId="hours"
                                            type="monotone"
                                            dataKey="hours"
                                            name="Hours"
                                            stroke="#4F46E5"
                                            strokeWidth={2}
                                            fill="url(#hoursGradient)"
                                            dot={false}
                                        />
                                    )}
                                    {hasGitHubData && (
                                        <Area
                                            yAxisId="commits"
                                            type="monotone"
                                            dataKey="commits"
                                            name="Commits"
                                            stroke="#F59E0B"
                                            strokeWidth={1.5}
                                            strokeDasharray="3 3"
                                            fill="url(#commitsGradient)"
                                            dot={false}
                                        />
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-4 mt-3 justify-center">
                            {hasExtensionData && (
                                <div className="flex items-center gap-1.5">
                                    <svg width="20" height="8">
                                        <line x1="0" y1="4" x2="20" y2="4" stroke="#4F46E5" strokeWidth="2"/>
                                    </svg>
                                    <span className="text-xs text-slate-400">Hours coded</span>
                                </div>
                            )}
                            {hasGitHubData && (
                                <div className="flex items-center gap-1.5">
                                    <svg width="20" height="8">
                                        <line x1="0" y1="4" x2="20" y2="4" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3"/>
                                    </svg>
                                    <span className="text-xs text-slate-400">Commits</span>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* ── LANGUAGE EVOLUTION + CODE STYLE ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                    {/* Language evolution */}
                    {hasExtensionData && languageTrend.months.length > 0 && (
                        <Section
                            title="Language evolution"
                            subtitle="How your language mix shifted over 6 months"
                            delay={0.3}
                        >
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={languageTrend.months}
                                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            {languageTrend.topLanguages.map((lang, i) => (
                                                <linearGradient key={lang} id={`lang${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0.05} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            dy={8}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            tickFormatter={v => `${v.toFixed(0)}h`}
                                            width={35}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => (
                                                <ChartTooltip
                                                    active={active}
                                                    payload={payload}
                                                    label={label}
                                                    formatter={v => formatHours(v)}
                                                />
                                            )}
                                        />
                                        {languageTrend.topLanguages.map((lang, i) => (
                                            <Area
                                                key={lang}
                                                type="monotone"
                                                dataKey={lang}
                                                name={lang}
                                                stroke={COLORS[i]}
                                                strokeWidth={1.5}
                                                fill={`url(#lang${i})`}
                                                dot={false}
                                                stackId="1"
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                {languageTrend.topLanguages.map((lang, i) => (
                                    <div key={lang} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-xs text-slate-400">{lang}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Favorite languages comparison */}
                    {(bests?.favoriteLanguageByTime || bests?.favoriteLanguageBySize) && (
                        <Section
                            title="Language favorites"
                            subtitle="Your top language from two different angles"
                            delay={0.35}
                        >
                            <div className="flex flex-col gap-4">
                                {bests?.favoriteLanguageByTime && (
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                            <FiClock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">By time spent — from editor</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                {bests.favoriteLanguageByTime[0]}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {formatSeconds(bests.favoriteLanguageByTime[1])} total
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {bests?.favoriteLanguageBySize && (
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                            <FiCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">By codebase size — from GitHub</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                {bests.favoriteLanguageBySize[0]}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {(bests.favoriteLanguageBySize[1] / 1000).toFixed(0)}KB across repos
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Streak comparison */}
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {hasExtensionData && (
                                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                                {bests?.longestCodingStreak || 0}d
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Longest coding streak</p>
                                        </div>
                                    )}
                                    {hasGitHubData && (
                                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                                {bests?.longestCommitStreak || 0}d
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Longest commit streak</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Section>
                    )}
                </div>

                {/* ── CODING RHYTHM ── */}
                {hasExtensionData && codingRhythm.grid && (
                    <div className="mt-6">
                        <Section
                            title="Coding rhythm"
                            subtitle="When during the week you code most — by hour and day"
                            delay={0.4}
                        >
                            <RhythmHeatmap
                                grid={codingRhythm.grid}
                                days={codingRhythm.days}
                            />
                        </Section>
                    </div>
                )}

                {/* ── TIME OF DAY + MILESTONES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {hasExtensionData && bests?.timeOfDayBreakdown && (
                        <Section
                            title="Time of day"
                            subtitle="When you do your best work"
                            delay={0.45}
                        >
                            <TimeOfDayBar breakdown={bests.timeOfDayBreakdown} />
                        </Section>
                    )}

                    <Section
                        title="Milestones"
                        subtitle="Your coding journey at a glance"
                        delay={0.5}
                    >
                        <Milestones bests={bests} userData={userData} />
                    </Section>
                </div>

            </div>
        </motion.main>
    )
}