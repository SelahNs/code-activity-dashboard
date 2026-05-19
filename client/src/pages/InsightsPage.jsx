import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { apiClient } from '../lib/api'
import useUserStore from '../stores/useUserStore'

// ── evenly spaced hues — works for any count ──
const generateColors = (count) =>
    Array.from({ length: count || 1 }, (_, i) => {
        const hue = Math.round((i / (count || 1)) * 360)
        return `hsl(${hue}, 65%, 55%)`
    })

const formatHours = (h) => {
    if (h === undefined || h === null) return '—'
    if (h === 0) return '0h'
    if (h < 1) return `${Math.round(h * 60)}m`
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}
const fmtSec = (s) => formatHours((s || 0) / 3600)
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const MomentumBadge = ({ pct }) => {
    if (pct === undefined || pct === null) return <span className="text-slate-400">—</span>
    const up = pct >= 0
    return (
        <span className={up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
            {up ? `+${pct}%` : `${pct}%`}
        </span>
    )
}

// ── shared tooltip ──
const Tip = ({ active, payload, label, fmt }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 max-w-[180px]">
            <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: {fmt ? fmt(p.value, p.name) : p.value}
                </p>
            ))}
        </div>
    )
}

// ── card ──
const Card = ({ title, subtitle, children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}
    >
        {(title || subtitle) && (
            <div className="mb-5">
                {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
        )}
        {children}
    </motion.div>
)

// ── stat pill ──
const Pill = ({ label, value, sub, accent }) => (
    <div className={`flex flex-col gap-1 p-4 rounded-xl ${
        accent ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-slate-50 dark:bg-slate-700/40'
    }`}>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-xl font-bold leading-tight ${
            accent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'
        }`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
)

// ── section label ──
const SL = ({ children }) => (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-10 mb-4 first:mt-0">
        {children}
    </p>
)

// ── skeleton ──
const Skeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
        {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
    </div>
)

// ── animated bar ──
const AnimBar = ({ pct, color, delay = 0 }) => (
    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
        />
    </div>
)

export default function InsightsPage() {
    const [bests, setBests] = useState(null)
    const [weeklyTrend, setWeeklyTrend] = useState([])
    const [langTrend, setLangTrend] = useState({ months: [], topLanguages: [] })
    const [ws, setWs] = useState(null)
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
        }).catch(e => console.error('Insights failed:', e))
          .finally(() => setLoading(false))
    }, [])

    if (loading) return <Skeleton />

    const hasExt = (userData?.stats?.totalSecondsCoded || 0) > 0
    const hasGH = true || !!(userData?.github?.username || userData?.github?.id)

    const langColors = generateColors(langTrend.topLanguages.length)
    const repoColors = generateColors(ws?.topRepos?.length || 1)

    const bucketData = ws?.sessionBuckets
        ? Object.entries(ws.sessionBuckets).map(([label, count]) => ({ label, count }))
        : []

    const peakHoursData = (bests?.hourBreakdown || [])
        .map(h => ({
            hour: `${h._id < 10 ? '0' : ''}${h._id}:00`,
            hours: parseFloat((h.totalSeconds / 3600).toFixed(2)),
            _id: h._id
        }))
        // fill missing hours with 0
        .concat(
            Array.from({ length: 24 }, (_, i) => i)
                .filter(i => !(bests?.hourBreakdown || []).find(h => h._id === i))
                .map(i => ({ hour: `${i < 10 ? '0' : ''}${i}:00`, hours: 0, _id: i }))
        )
        .sort((a, b) => a._id - b._id)

    const maxPeakHours = Math.max(...peakHoursData.map(d => d.hours), 0)

    const archetypeEmoji = {
        'The Marathoner': '🏃', 'The Sprinter': '⚡',
        'The Explorer': '🧭', 'The Architect': '🏗️',
        'The Refactor Goblin': '👺', 'The Builder': '🔨',
    }

    return (
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Insights</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Deep patterns, personal bests, and your coding identity.
                    </p>
                </header>

                {/* ═══════════════════════════════════
                    SECTION 1 — PERFORMANCE
                ═══════════════════════════════════ */}
                {hasExt && (
                    <>
                        <SL>Performance</SL>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Pill
                                label="Consistency score"
                                value={`${ws?.consistencyScore ?? 0}%`}
                                sub={`${ws?.totalDaysCoded ?? 0} of ${ws?.possibleDays ?? 0} possible days`}
                                accent
                            />
                            <Pill
                                label="Deep work ratio"
                                value={`${ws?.deepWorkRatio ?? 0}%`}
                                sub={`Sessions ≥ 45 min · avg ${fmtSec(ws?.avgDeepSessionSeconds)}`}
                            />
                            <Pill
                                label="Avg session"
                                value={fmtSec(ws?.avgSessionSeconds)}
                                sub={`${(ws?.totalSessions ?? 0).toLocaleString()} total sessions`}
                            />
                            <Pill
                                label="Monthly momentum"
                                value={<MomentumBadge pct={ws?.codingMomentumPct} />}
                                sub={`${ws?.thisMonthHours ?? 0}h this month vs ${ws?.lastMonthHours ?? 0}h last`}
                            />
                        </div>
                    </>
                )}

                {/* ═══════════════════════════════════
                    SECTION 2 — WORK STYLE
                ═══════════════════════════════════ */}
                {hasExt && (
                    <>
                        <SL>Work style</SL>

                        {/* 4 metric cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <Pill
                                label="Keyboard intensity"
                                value={(ws?.keystrokesPerHour || 0).toLocaleString()}
                                sub="keystrokes / hour"
                            />
                            <Pill
                                label="Rewrite style"
                                value={ws?.deleteLabel || '—'}
                                sub={`${Math.round((ws?.deleteRatio || 0) * 100)}% chars deleted`}
                            />
                            <Pill
                                label="Project switching"
                                value={ws?.projectSwitchLabel || '—'}
                                sub={`${ws?.avgProjectsPerDay ?? 0} projects / day avg`}
                            />
                            <Pill
                                label="Editor loyalty"
                                value={ws?.editorBreakdown?.[0]?.editor
                                    ? ws.editorBreakdown[0].editor.charAt(0).toUpperCase() + ws.editorBreakdown[0].editor.slice(1)
                                    : '—'}
                                sub={`${ws?.editorBreakdown?.[0]?.pct ?? 0}% of time`}
                            />
                        </div>

                        {/* Editor breakdown bar — only if >1 editor */}
                        {(ws?.editorBreakdown?.length || 0) > 1 && (
                            <Card title="Editor breakdown" subtitle="Time split across editors" delay={0.05} className="mb-4">
                                <div className="flex flex-col gap-3">
                                    {ws.editorBreakdown.map((e, i) => (
                                        <div key={e.editor} className="flex items-center gap-3">
                                            <span className="text-sm text-slate-600 dark:text-slate-300 w-24 flex-shrink-0 capitalize">{e.editor}</span>
                                            <AnimBar pct={e.pct} color="#4F46E5" delay={i * 0.08} />
                                            <span className="text-xs text-slate-400 w-8 text-right flex-shrink-0">{e.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Coding archetype */}
                        {ws?.archetype && (
                            <Card delay={0.1} className="mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-3xl flex-shrink-0">
                                        {archetypeEmoji[ws.archetype] || '🔨'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-400 mb-1">Coding archetype</p>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{ws.archetype}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{ws.archetypeDesc}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                                        {[
                                            { label: 'Consistency', value: `${ws.consistencyScore}%` },
                                            { label: 'Deep work', value: `${ws.deepWorkRatio}%` },
                                            { label: 'Night owl', value: `${ws.nightOwlScore}%` },
                                        ].map(s => (
                                            <div key={s.label} className="text-center px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════
                    SECTION 3 — PATTERNS
                ═══════════════════════════════════ */}
                {hasExt && (
                    <>
                        <SL>Patterns</SL>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                            {/* Session distribution */}
                            {bucketData.length > 0 && (
                                <Card title="Session distribution" subtitle="How long your sessions typically run" delay={0.15}>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={bucketData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={30} />
                                                <Tooltip content={<Tip fmt={v => `${v} sessions`} />} />
                                                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                                                    {bucketData.map((d, i) => {
                                                        const max = Math.max(...bucketData.map(x => x.count))
                                                        return <Cell key={i} fill={d.count === max ? '#4F46E5' : '#e2e8f0'} />
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}

                            {/* Weekday productivity */}
                            {(ws?.weekdayHours?.length || 0) > 0 && (
                                <Card
                                    title="Weekday productivity"
                                    subtitle={ws?.bestWeekday ? `Strongest day: ${ws.bestWeekday}` : 'Avg hours by day of week'}
                                    delay={0.2}
                                >
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ws.weekdayHours} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}h`} width={30} />
                                                <Tooltip content={<Tip fmt={v => formatHours(v)} />} />
                                                <Bar dataKey="hours" name="Hours" radius={[4, 4, 0, 0]}>
                                                    {ws.weekdayHours.map((d, i) => (
                                                        <Cell key={i} fill={d.label === ws.bestWeekday ? '#4F46E5' : '#e2e8f0'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Peak hours 0-23 */}
                        {peakHoursData.length > 0 && (
                            <Card
                                title="Peak hours"
                                subtitle={`Your coding peaks around ${bests?.peakWindow || '—'}`}
                                delay={0.25}
                                className="mb-4"
                            >
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={peakHoursData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 10, fill: '#64748b' }} interval={2} />
                                            <YAxis axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                tickFormatter={v => `${v}h`} width={30} />
                                            <Tooltip content={<Tip fmt={v => formatHours(v)} />} />
                                            <Bar dataKey="hours" name="Hours" radius={[3, 3, 0, 0]}>
                                                {peakHoursData.map((d, i) => (
                                                    <Cell key={i} fill={d.hours === maxPeakHours && d.hours > 0 ? '#4F46E5' : '#e2e8f0'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        )}

                        {/* Weekend vs weekday */}
                        <Card title="Weekend vs weekday" subtitle="Where your coding time goes" delay={0.3} className="mb-4">
                            <div className="flex items-center gap-8">
                                <div className="flex-1 space-y-4">
                                    {[
                                        { label: 'Weekday', pct: 100 - (ws?.weekendPct ?? 0), color: '#4F46E5' },
                                        { label: 'Weekend', pct: ws?.weekendPct ?? 0, color: '#F59E0B' },
                                    ].map((row, i) => (
                                        <div key={row.label}>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{row.label}</span>
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.pct}%</span>
                                            </div>
                                            <AnimBar pct={row.pct} color={row.color} delay={i * 0.1} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-shrink-0 text-center px-6 py-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-3xl mb-1">{(ws?.weekendPct ?? 0) > 40 ? '🏄' : '💼'}</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {(ws?.weekendPct ?? 0) > 40 ? 'Weekend warrior' : 'Weekday coder'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                {/* ═══════════════════════════════════
                    SECTION 4 — GITHUB DEEP DIVE
                ═══════════════════════════════════ */}
                {hasGH && (
                    <>
                        <SL>GitHub deep dive</SL>

                        {/* Commit velocity */}
                        {(ws?.velocityData?.length || 0) > 0 && (
                            <Card
                                title="Commit velocity"
                                subtitle="Commits per hour coded — how much you ship relative to time spent"
                                delay={0.35}
                                className="mb-4"
                            >
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={ws.velocityData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="label" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }} dy={8} interval="preserveStartEnd" />
                                            <YAxis axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }} width={30} />
                                            <Tooltip content={<Tip fmt={(v, n) =>
                                                n === 'Velocity' ? `${v} commits/h`
                                                : n === 'Hours' ? formatHours(v)
                                                : `${v} commits`
                                            } />} />
                                            <ReferenceLine
                                                y={ws.velocityData.reduce((s, d) => s + d.velocity, 0) / ws.velocityData.length}
                                                stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1}
                                            />
                                            <Line type="monotone" dataKey="velocity" name="Velocity"
                                                stroke="#10B981" strokeWidth={2.5} dot={false}
                                                activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                            {/* PR merge rate */}
                            {(ws?.prTrend?.length || 0) > 0 && (
                                <Card title="PR merge rate" subtitle="Opened vs merged PRs — last 6 months" delay={0.4}>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ws.prTrend} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={28} />
                                                <Tooltip content={<Tip fmt={(v, n) => `${v}${n === 'Merge rate' ? '%' : ' PRs'}`} />} />
                                                <Bar dataKey="opened" name="Opened" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="merged" name="Merged" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            )}

                            {/* Most active repos */}
                            {(ws?.topRepos?.length || 0) > 0 && (
                                <Card title="Most active repos" subtitle="By total commit count" delay={0.45}>
                                    <div className="flex flex-col gap-3">
                                        {ws.topRepos.map((repo, i) => {
                                            const pct = (repo.commits / ws.topRepos[0].commits) * 100
                                            return (
                                                <div key={repo.name} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: repoColors[i] }} />
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 w-28 truncate flex-shrink-0">{repo.name}</span>
                                                    <AnimBar pct={pct} color={repoColors[i]} delay={i * 0.07} />
                                                    <span className="text-xs text-slate-400 w-20 text-right flex-shrink-0">{repo.commits} commits</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Commit message quality */}
                        {(ws?.avgCommitMessageLength || 0) > 0 && (
                            <Card
                                title="Commit message quality"
                                subtitle="Average message length — a proxy for documentation habit"
                                delay={0.5}
                                className="mb-4"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                Avg {ws.avgCommitMessageLength} characters
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {ws.commitMessageLabel}
                                            </span>
                                        </div>
                                        <AnimBar
                                            pct={Math.min(100, (ws.avgCommitMessageLength / 80) * 100)}
                                            color="#10B981"
                                            delay={0}
                                        />
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-xs text-slate-400">Terse (&lt;20)</span>
                                            <span className="text-xs text-slate-400">Clear (20-50)</span>
                                            <span className="text-xs text-slate-400">Detailed (50+)</span>
                                        </div>
                                    </div>
                                    <div className="text-3xl flex-shrink-0">
                                        {ws.avgCommitMessageLength < 20 ? '✂️' : ws.avgCommitMessageLength < 50 ? '📝' : '📖'}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════
                    SECTION 5 — GROWTH
                ═══════════════════════════════════ */}
                <SL>Growth</SL>

                {/* Language evolution */}
                {hasExt && langTrend.months.length > 0 && (
                    <Card title="Language evolution" subtitle="How your language mix shifted over 6 months" delay={0.55} className="mb-4">
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={langTrend.months} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        {langTrend.topLanguages.map((lang, i) => (
                                            <linearGradient key={lang} id={`lg${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={langColors[i]} stopOpacity={0.45} />
                                                <stop offset="95%" stopColor={langColors[i]} stopOpacity={0.03} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v.toFixed(0)}h`} width={32} />
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {hasExt && <>
                        <Pill label="Best day — hours" value={fmtSec(bests?.bestDayByHours?.totalSeconds)} sub={fmtDate(bests?.bestDayByHours?._id)} accent />
                        <Pill label="Best week — hours" value={fmtSec(bests?.bestWeekByHours?.totalSeconds)} sub={bests?.bestWeekByHours?.firstDay ? `Week of ${fmtDate(bests.bestWeekByHours.firstDay)}` : '—'} />
                        <Pill label="Longest session" value={fmtSec(bests?.longestSession?.duration)} sub={fmtDate(bests?.longestSession?.capturedAt)} />
                        <Pill label="Most active day" value={`${(bests?.mostKeystrokesDay?.totalKeystrokes || 0).toLocaleString()} keys`} sub={fmtDate(bests?.mostKeystrokesDay?._id)} />
                    </>}
                    {hasGH && <>
                        <Pill label="Best commit day" value={`${bests?.bestDayByCommits?.count ?? 0} commits`} sub={fmtDate(bests?.bestDayByCommits?._id)} accent />
                        <Pill label="Best commit week" value={`${bests?.bestWeekByCommits?.count ?? 0} commits`} sub={bests?.bestWeekByCommits?.firstDay ? `Week of ${fmtDate(bests.bestWeekByCommits.firstDay)}` : '—'} />
                        <Pill label="Longest commit streak" value={`${bests?.longestCommitStreak ?? 0}d`} sub="consecutive days" />
                        <Pill label="Best PR week" value={`${bests?.bestWeekByPRs?.count ?? 0} merged`} sub={bests?.bestWeekByPRs?.firstDay ? `Week of ${fmtDate(bests.bestWeekByPRs.firstDay)}` : '—'} />
                    </>}
                </div>

                {/* Milestones */}
                <Card title="Milestones" subtitle="Your coding journey at a glance" delay={0.65}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[
                            hasGH && bests?.firstCommit && { emoji: '🎯', label: 'First commit', value: fmtDate(bests.firstCommit.timestamp) },
                            hasExt && { emoji: '⏱️', label: 'Total hours coded', value: fmtSec(userData?.stats?.totalSecondsCoded) },
                            hasExt && { emoji: '📅', label: 'Days coded', value: `${ws?.totalDaysCoded ?? 0} days` },
                            hasExt && { emoji: '🔥', label: 'Longest coding streak', value: `${bests?.longestCodingStreak ?? 0} days` },
                            hasGH && { emoji: '⚡', label: 'Longest commit streak', value: `${bests?.longestCommitStreak ?? 0} days` },
                            hasExt && { emoji: '🧠', label: 'Total sessions', value: (ws?.totalSessions ?? 0).toLocaleString() },
                            hasGH && bests?.mostProlificRepo && { emoji: '🏆', label: 'Top repo', value: bests.mostProlificRepo._id?.split('/').pop() || '—' },
                            hasExt && { emoji: '🌙', label: 'Peak coding time', value: bests?.peakWindow || '—' },
                        ].filter(Boolean).map((m, i) => (
                            <motion.div
                                key={m.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.65 + i * 0.04 }}
                                className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl gap-2"
                            >
                                <span className="text-2xl">{m.emoji}</span>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{m.value}</p>
                                <p className="text-xs text-slate-400 leading-tight">{m.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </Card>

            </div>
        </motion.main>
    )
}