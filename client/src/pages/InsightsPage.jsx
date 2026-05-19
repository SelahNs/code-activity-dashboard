import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { apiClient } from '../lib/api'
import useUserStore from '../stores/useUserStore'

// ── Color generator — evenly spaced hues, never random ──
const generateColors = (count) =>
    Array.from({ length: count }, (_, i) => {
        const hue = Math.round((i / count) * 360)
        return `hsl(${hue}, 65%, 55%)`
    })

const formatHours = (h) => {
    if (!h) return '0h'
    if (h < 1) return `${Math.round(h * 60)}m`
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}

const formatSeconds = (s) => formatHours((s || 0) / 3600)

const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const pctColor = (pct) => pct >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-500 dark:text-red-400'

const pctLabel = (pct) => pct >= 0 ? `+${pct}%` : `${pct}%`

// ── Shared tooltip ──
const Tip = ({ active, payload, label, fmt }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: {fmt ? fmt(p.value, p.name) : p.value}
                </p>
            ))}
        </div>
    )
}

// ── Card wrapper ──
const Card = ({ title, subtitle, children, className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}
    >
        {(title || subtitle) && (
            <div className="mb-4">
                {title && <h2 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h2>}
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
        )}
        {children}
    </motion.div>
)

// ── Stat pill ──
const Stat = ({ label, value, sub, accent = false }) => (
    <div className={`flex flex-col gap-0.5 p-4 rounded-xl ${accent ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-slate-50 dark:bg-slate-700/40'}`}>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-xl font-bold leading-tight ${accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {value}
        </p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
)

// ── Section label ──
const SectionLabel = ({ children }) => (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">
        {children}
    </p>
)

// ── Loading skeleton ──
const Skeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                ))}
            </div>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
        </div>
    </div>
)

export default function InsightsPage() {
    const [bests, setBests] = useState(null)
    const [weeklyTrend, setWeeklyTrend] = useState([])
    const [langTrend, setLangTrend] = useState({ months: [], topLanguages: [] })
    const [ws, setWs] = useState(null) // workStyle
    const [loading, setLoading] = useState(true)
    const { userData, fetchUser } = useUserStore()

    useEffect(() => {
        fetchUser()
        Promise.all([
            apiClient.getBests(),
            apiClient.getWeeklyTrend(),
            apiClient.getLanguageTrend(),
            apiClient.getWorkStyle(),
        ]).then(([b, t, l, w]) => {
            setBests(b)
            setWeeklyTrend(t.weeks || [])
            setLangTrend(l)
            setWs(w)
        }).catch(e => console.error('Insights fetch failed:', e))
          .finally(() => setLoading(false))
    }, [])

    if (loading) return <Skeleton />

    const hasExtension = (userData?.stats?.totalSecondsCoded || 0) > 0
    const hasGitHub = !!(userData?.github?.username || userData?.github?.id)

    const langColors = generateColors(langTrend.topLanguages.length)
    const repoColors = generateColors(ws?.topRepos?.length || 0)

    const sessionBucketData = ws?.sessionBuckets
        ? Object.entries(ws.sessionBuckets).map(([label, count]) => ({ label, count }))
        : []

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
                        Deep patterns, personal bests, and your coding identity.
                    </p>
                </header>

                {/* ══════════════════════════════════════
                    SECTION — OVERVIEW
                ══════════════════════════════════════ */}
                <SectionLabel>Overview</SectionLabel>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {hasExtension && (
                        <>
                            <Stat
                                label="Consistency score"
                                value={`${ws?.consistencyScore ?? 0}%`}
                                sub={`${ws?.totalDaysCoded ?? 0} of ${ws?.possibleDays ?? 0} days`}
                                accent
                            />
                            <Stat
                                label="Deep work ratio"
                                value={`${ws?.deepWorkRatio ?? 0}%`}
                                sub={`Avg deep session ${formatSeconds(ws?.avgDeepSessionSeconds)}`}
                            />
                            <Stat
                                label="Avg session"
                                value={formatSeconds(ws?.avgSessionSeconds)}
                                sub={`${ws?.totalSessions ?? 0} total sessions`}
                            />
                            <Stat
                                label="Coding momentum"
                                value={<span className={pctColor(ws?.codingMomentumPct)}>
                                    {pctLabel(ws?.codingMomentumPct ?? 0)}
                                </span>}
                                sub={`${ws?.thisMonthHours ?? 0}h this month vs ${ws?.lastMonthHours ?? 0}h last`}
                            />
                        </>
                    )}
                    {hasGitHub && (
                        <>
                            <Stat
                                label="Commit momentum"
                                value={<span className={pctColor(ws?.commitMomentumPct)}>
                                    {pctLabel(ws?.commitMomentumPct ?? 0)}
                                </span>}
                                sub={`${ws?.githubThisMonth ?? 0} commits this month`}
                            />
                            <Stat
                                label="Current commit streak"
                                value={`${bests?.currentCommitStreak ?? 0}d`}
                                sub={`Best: ${bests?.longestCommitStreak ?? 0} days`}
                            />
                            <Stat
                                label="Best commit day"
                                value={`${bests?.bestDayByCommits?.count ?? 0} commits`}
                                sub={formatDate(bests?.bestDayByCommits?._id)}
                            />
                            <Stat
                                label="Coding since"
                                value={bests?.firstCommit
                                    ? new Date(bests.firstCommit.timestamp)
                                        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                    : '—'}
                                sub="First GitHub commit"
                            />
                        </>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    SECTION — TRENDS
                ══════════════════════════════════════ */}
                {weeklyTrend.length > 0 && (
                    <>
                        <SectionLabel>Trends</SectionLabel>
                        <Card
                            title="Weekly trend"
                            subtitle={
                                hasExtension && hasGitHub
                                    ? "Hours coded and commits per week — last 12 months"
                                    : hasExtension
                                        ? "Hours coded per week — last 12 months"
                                        : "Commits per week — last 12 months"
                            }
                            delay={0.1}
                        >
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="wHours" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02}/>
                                            </linearGradient>
                                            <linearGradient id="wCommits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="label" axisLine={false} tickLine={false}
                                            tick={{ fontSize: 11, fill: '#64748b' }} dy={8}
                                            interval="preserveStartEnd" />
                                        {hasExtension && (
                                            <YAxis yAxisId="h" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                tickFormatter={v => `${v.toFixed(0)}h`} width={32} />
                                        )}
                                        {hasGitHub && (
                                            <YAxis yAxisId="c" orientation="right" axisLine={false}
                                                tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={28} />
                                        )}
                                        <Tooltip content={<Tip fmt={(v, n) =>
                                            n === 'Hours' ? formatHours(v) : `${v} commits`
                                        } />} />
                                        {hasExtension && (
                                            <Area yAxisId="h" type="monotone" dataKey="hours" name="Hours"
                                                stroke="#4F46E5" strokeWidth={2} fill="url(#wHours)" dot={false} />
                                        )}
                                        {hasGitHub && (
                                            <Area yAxisId="c" type="monotone" dataKey="commits" name="Commits"
                                                stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3"
                                                fill="url(#wCommits)" dot={false} />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-3">
                                {hasExtension && (
                                    <div className="flex items-center gap-1.5">
                                        <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#4F46E5" strokeWidth="2"/></svg>
                                        <span className="text-xs text-slate-400">Hours coded</span>
                                    </div>
                                )}
                                {hasGitHub && (
                                    <div className="flex items-center gap-1.5">
                                        <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3"/></svg>
                                        <span className="text-xs text-slate-400">Commits</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </>
                )}

                {/* Commit velocity */}
                {hasExtension && hasGitHub && ws?.velocityData?.length > 0 && (
                    <Card
                        title="Commit velocity"
                        subtitle="Commits per hour coded — how much you ship relative to time spent"
                        className="mt-4"
                        delay={0.15}
                    >
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ws.velocityData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="label" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }} dy={8}
                                        interval="preserveStartEnd" />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        tickFormatter={v => `${v}`} width={32} />
                                    <Tooltip content={<Tip fmt={(v, n) =>
                                        n === 'Velocity' ? `${v} commits/h` : n === 'Hours' ? formatHours(v) : `${v} commits`
                                    } />} />
                                    <ReferenceLine
                                        y={ws.velocityData.reduce((s, d) => s + d.velocity, 0) / ws.velocityData.length}
                                        stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1}
                                    />
                                    <Line type="monotone" dataKey="velocity" name="Velocity"
                                        stroke="#10B981" strokeWidth={2} dot={false}
                                        activeDot={{ r: 4, fill: '#10B981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}

                {/* ══════════════════════════════════════
                    SECTION — WORK STYLE
                ══════════════════════════════════════ */}
                {hasExtension && (
                    <>
                        <SectionLabel>Work style</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Session distribution */}
                            {sessionBucketData.length > 0 && (
                                <Card title="Session distribution" subtitle="How long your coding sessions typically run" delay={0.2}>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sessionBucketData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }} width={32} />
                                                <Tooltip content={<Tip fmt={v => `${v} sessions`} />} />
                                                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                                                    {sessionBucketData.map((_, i) => (
                                                        <Cell key={i} fill={i === 2 ? '#4F46E5' : '#cbd5e1'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}

                            {/* Weekday productivity */}
                            {ws?.weekdayHours?.length > 0 && (
                                <Card
                                    title="Weekday productivity"
                                    subtitle={ws?.bestWeekday ? `Your strongest day is ${ws.bestWeekday}` : 'Hours coded by day of week'}
                                    delay={0.25}
                                >
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ws.weekdayHours} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                                    tickFormatter={v => `${v}h`} width={32} />
                                                <Tooltip content={<Tip fmt={v => formatHours(v)} />} />
                                                <Bar dataKey="hours" name="Hours" radius={[4, 4, 0, 0]}>
                                                    {ws.weekdayHours.map((d, i) => (
                                                        <Cell key={i}
                                                            fill={d.label === ws.bestWeekday ? '#4F46E5' : '#cbd5e1'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Personality cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <Stat
                                label="Keyboard intensity"
                                value={`${(ws?.keystrokesPerHour || 0).toLocaleString()}`}
                                sub="keystrokes / hour"
                            />
                            <Stat
                                label="Rewrite style"
                                value={ws?.deleteLabel || '—'}
                                sub={`${Math.round((ws?.deleteRatio || 0) * 100)}% delete ratio`}
                            />
                            <Stat
                                label="Work pattern"
                                value={ws?.projectSwitchLabel || '—'}
                                sub={`${ws?.avgProjectsPerDay ?? 0} projects/day avg`}
                            />
                            <Stat
                                label="Weekend vs weekday"
                                value={`${ws?.weekendPct ?? 0}% weekend`}
                                sub={ws?.weekendPct > 40 ? 'Weekend warrior' : 'Weekday coder'}
                            />
                        </div>

                        {/* Peak hours */}
                        <Card
                            title="Peak coding window"
                            subtitle={`You do your best work ${bests?.peakWindow || '—'}`}
                            className="mt-4"
                            delay={0.3}
                        >
                            <div className="flex flex-col gap-2">
                                {bests?.timeOfDaySlots?.map((slot, i) => {
                                    const total = bests.timeOfDaySlots.reduce((s, t) => s + t.seconds, 0)
                                    const pct = total > 0 ? (slot.seconds / total) * 100 : 0
                                    const isTop = slot.label === bests.favoriteTimeOfDay?.label
                                    return (
                                        <div key={slot.label} className="flex items-center gap-3">
                                            <span className="text-base w-6">{slot.emoji}</span>
                                            <span className={`text-sm w-24 flex-shrink-0 ${isTop ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {slot.label}
                                            </span>
                                            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${isTop ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400 w-10 text-right flex-shrink-0">
                                                {formatSeconds(slot.seconds)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </>
                )}

                {/* ══════════════════════════════════════
                    SECTION — GITHUB DEEP DIVE
                ══════════════════════════════════════ */}
                {hasGitHub && (
                    <>
                        <SectionLabel>GitHub deep dive</SectionLabel>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* PR merge rate */}
                            {ws?.prTrend?.length > 0 && (
                                <Card title="PR merge rate" subtitle="Opened vs merged pull requests over 6 months" delay={0.35}>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ws.prTrend} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#64748b' }} width={28} />
                                                <Tooltip content={<Tip fmt={(v, n) => n === 'Merge rate' ? `${v}%` : `${v} PRs`} />} />
                                                <Bar dataKey="opened" name="Opened" fill="#cbd5e1" radius={[4,4,0,0]} />
                                                <Bar dataKey="merged" name="Merged" fill="#4F46E5" radius={[4,4,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}

                            {/* Most active repos */}
                            {ws?.topRepos?.length > 0 && (
                                <Card title="Most active repos" subtitle="By total commit count" delay={0.4}>
                                    <div className="flex flex-col gap-3">
                                        {ws.topRepos.map((repo, i) => {
                                            const max = ws.topRepos[0].commits
                                            const pct = (repo.commits / max) * 100
                                            return (
                                                <div key={repo.name} className="flex items-center gap-3">
                                                    <div
                                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: repoColors[i] }}
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 w-32 truncate flex-shrink-0">
                                                        {repo.name}
                                                    </span>
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.5, delay: i * 0.08 }}
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: repoColors[i] }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-400 w-16 text-right flex-shrink-0">
                                                        {repo.commits} commits
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════
                    SECTION — GROWTH
                ══════════════════════════════════════ */}
                <SectionLabel>Growth</SectionLabel>

                {/* Language evolution */}
                {hasExtension && langTrend.months.length > 0 && (
                    <Card
                        title="Language evolution"
                        subtitle="How your language mix shifted over 6 months"
                        delay={0.45}
                    >
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={langTrend.months} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        {langTrend.topLanguages.map((lang, i) => (
                                            <linearGradient key={lang} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={langColors[i]} stopOpacity={0.45}/>
                                                <stop offset="95%" stopColor={langColors[i]} stopOpacity={0.03}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <XAxis dataKey="label" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        tickFormatter={v => `${v.toFixed(0)}h`} width={32} />
                                    <Tooltip content={<Tip fmt={v => formatHours(v)} />} />
                                    {langTrend.topLanguages.map((lang, i) => (
                                        <Area key={lang} type="monotone" dataKey={lang} name={lang}
                                            stroke={langColors[i]} strokeWidth={1.5}
                                            fill={`url(#lg${i})`} dot={false} stackId="1" />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3 justify-center">
                            {langTrend.topLanguages.map((lang, i) => (
                                <div key={lang} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[i] }} />
                                    <span className="text-xs text-slate-400">{lang}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Personal bests */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {hasExtension && (
                        <>
                            <Stat
                                label="Best day — hours"
                                value={formatSeconds(bests?.bestDayByHours?.totalSeconds)}
                                sub={formatDate(bests?.bestDayByHours?._id)}
                                accent
                            />
                            <Stat
                                label="Best week — hours"
                                value={formatSeconds(bests?.bestWeekByHours?.totalSeconds)}
                                sub={bests?.bestWeekByHours?.firstDay
                                    ? `Week of ${formatDate(bests.bestWeekByHours.firstDay)}` : '—'}
                            />
                            <Stat
                                label="Longest session"
                                value={formatSeconds(bests?.longestSession?.duration)}
                                sub={formatDate(bests?.longestSession?.capturedAt)}
                            />
                            <Stat
                                label="Night owl score"
                                value={`${ws?.nightOwlScore ?? 0}%`}
                                sub="of coding after 9 PM"
                            />
                        </>
                    )}
                    {hasGitHub && (
                        <>
                            <Stat
                                label="Best week — commits"
                                value={`${bests?.bestWeekByCommits?.count ?? 0}`}
                                sub={bests?.bestWeekByCommits?.firstDay
                                    ? `Week of ${formatDate(bests.bestWeekByCommits.firstDay)}` : '—'}
                                accent
                            />
                            <Stat
                                label="Best PR week"
                                value={`${bests?.bestWeekByPRs?.count ?? 0} merged`}
                                sub={bests?.bestWeekByPRs?.firstDay
                                    ? `Week of ${formatDate(bests.bestWeekByPRs.firstDay)}` : '—'}
                            />
                            <Stat
                                label="Longest commit streak"
                                value={`${bests?.longestCommitStreak ?? 0}d`}
                                sub="consecutive days"
                            />
                            <Stat
                                label="Most prolific repo"
                                value={bests?.mostProlificRepo?._id?.split('/').pop() || '—'}
                                sub={`${bests?.mostProlificRepo?.count ?? 0} commits`}
                            />
                        </>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    SECTION — PERSONALITY
                ══════════════════════════════════════ */}
                {hasExtension && ws?.archetype && (
                    <>
                        <SectionLabel>Your coding identity</SectionLabel>
                        <Card delay={0.5}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl">
                                    {ws.archetype === 'The Marathoner' ? '🏃' :
                                     ws.archetype === 'The Sprinter' ? '⚡' :
                                     ws.archetype === 'The Explorer' ? '🧭' :
                                     ws.archetype === 'The Architect' ? '🏗️' :
                                     ws.archetype === 'The Refactor Goblin' ? '👺' : '🔨'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                        {ws.archetype}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {ws.archetypeDesc}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
                                    <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {ws.consistencyScore}%
                                        </p>
                                        <p className="text-xs text-slate-400">Consistency</p>
                                    </div>
                                    <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {ws.deepWorkRatio}%
                                        </p>
                                        <p className="text-xs text-slate-400">Deep work</p>
                                    </div>
                                    <div className="text-center px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                            {ws.nightOwlScore}%
                                        </p>
                                        <p className="text-xs text-slate-400">Night owl</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

            </div>
        </motion.main>
    )
}