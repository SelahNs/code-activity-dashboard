// src/components/ShippingHeatmap.jsx
import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CELL_GAP = 3
const DAY_LABEL_WIDTH = 28
const WEEKS_PER_VIEW = 26

const getIntensityColor = (score) => {
    if (score === 0) return 'bg-slate-100 dark:bg-slate-700/50'
    if (score <= 2) return 'bg-blue-200 dark:bg-blue-900'
    if (score <= 5) return 'bg-blue-400 dark:bg-blue-700'
    if (score <= 10) return 'bg-blue-600 dark:bg-blue-500'
    return 'bg-blue-800 dark:bg-blue-400'
}

const buildWeeks = (dailyActivity, offset) => {
    // offset 0 = most recent 26 weeks
    // offset 1 = 26 weeks before that, etc.
    const now = new Date()
    now.setHours(23, 59, 59, 999)

    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() - offset * WEEKS_PER_VIEW * 7)

    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - (WEEKS_PER_VIEW * 7 - 1))
    startDate.setHours(0, 0, 0, 0)

    // Rewind to Monday
    const dow = startDate.getDay()
    startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1))

    const days = []
    const cursor = new Date(startDate)

    while (cursor <= endDate) {
        const key = cursor.toISOString().split('T')[0]
        const activity = dailyActivity[key] || { commits: 0, prs: 0, releases: 0 }
        const score = activity.commits + (activity.prs * 2) + (activity.releases * 3)
        const isFuture = new Date(cursor) > now
        days.push({ key, date: new Date(cursor), activity, score, isFuture })
        cursor.setDate(cursor.getDate() + 1)
    }

    // Pad last week
    while (days.length % 7 !== 0) {
        days.push({
            key: `pad-${days.length}`,
            date: new Date(cursor),
            activity: { commits: 0, prs: 0, releases: 0 },
            score: 0,
            isFuture: true
        })
        cursor.setDate(cursor.getDate() + 1)
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    return { weeks, startDate, endDate }
}

const getMonthLabels = (weeks, cellSize) => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, colIndex) => {
        const firstReal = week.find(d => !d.isFuture)
        if (!firstReal) return
        const month = firstReal.date.toLocaleDateString('en-US', { month: 'short' })
        const year = firstReal.date.getFullYear()
        const label = month === 'Jan' ? `Jan ${year}` : month
        if (month !== lastMonth) {
            labels.push({ label, colIndex })
            lastMonth = month
        }
    })
    return labels
}

const getPeriodLabel = (offset, startDate, endDate) => {
    if (offset === 0) return 'Last 6 months'
    const start = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const end = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${start} — ${end}`
}

export default function ShippingHeatmap({ dailyActivity = {} }) {
    const [offset, setOffset] = useState(0)
    const [animDir, setAnimDir] = useState(1)
    const [tooltip, setTooltip] = useState(null)
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(entries => {
            setContainerWidth(entries[0].contentRect.width)
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const { weeks, startDate, endDate } = useMemo(
        () => buildWeeks(dailyActivity, offset),
        [dailyActivity, offset]
    )

    // Responsive cell size — fills container, clamps between min and max
    // Replace the naturalCell / cellSize calculation with:
const availableWidth = Math.max(0, containerWidth - DAY_LABEL_WIDTH)
const numWeeks = weeks.length
const colWidth = numWeeks > 0
    ? Math.max(8, Math.floor((availableWidth - (numWeeks - 1) * CELL_GAP) / numWeeks))
    : 12
const cellSize = Math.min(16, colWidth) // still used for row heights

    const monthLabels = useMemo(
        () => getMonthLabels(weeks, cellSize),
        [weeks, cellSize]
    )

    const hasOlderData = useMemo(() => {
        const keys = Object.keys(dailyActivity)
        if (keys.length === 0) return false
        const earliest = new Date(keys.sort()[0])
        return earliest < startDate
    }, [dailyActivity, startDate])

    const canGoForward = offset > 0

    const goBack = () => {
        if (!hasOlderData) return
        setAnimDir(1)
        setOffset(o => o + 1)
        setTooltip(null)
    }

    const goForward = () => {
        if (!canGoForward) return
        setAnimDir(-1)
        setOffset(o => o - 1)
        setTooltip(null)
    }

    const handleMouseEnter = (e, day) => {
        if (day.isFuture) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top
        const clampedX = Math.max(130, Math.min(x, window.innerWidth - 130))
        setTooltip({ ...day, x: clampedX, y })
    }

    const periodLabel = getPeriodLabel(offset, startDate, endDate)
    const isEmpty = weeks.every(w => w.every(d => d.score === 0 || d.isFuture))

    // Total activity in this period for the summary line
    const periodTotals = useMemo(() => {
        let commits = 0, prs = 0, releases = 0
        weeks.flat().forEach(d => {
            if (!d.isFuture) {
                commits += d.activity.commits
                prs += d.activity.prs
                releases += d.activity.releases
            }
        })
        return { commits, prs, releases }
    }, [weeks])

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        Shipping Activity
                    </h3>
                    {/* Period totals — makes the heatmap obvious at a glance */}
                    {!isEmpty ? (
                        <p className="text-xs text-slate-400 mt-0.5">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {periodTotals.commits}
                            </span> commits ·{' '}
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {periodTotals.prs}
                            </span> PRs ·{' '}
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {periodTotals.releases}
                            </span> releases this period
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 mt-0.5">
                            Commits · PRs merged · Releases
                        </p>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0 ml-4">
                    <span className="hidden sm:inline">Less</span>
                    {[
                        'bg-slate-100 dark:bg-slate-700/50',
                        'bg-blue-200 dark:bg-blue-900',
                        'bg-blue-400 dark:bg-blue-700',
                        'bg-blue-600 dark:bg-blue-500',
                        'bg-blue-800 dark:bg-blue-400'
                    ].map((c, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                    ))}
                    <span className="hidden sm:inline">More</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
                <motion.button
                    onClick={goBack}
                    disabled={!hasOlderData}
                    whileTap={hasOlderData ? { scale: 0.92 } : {}}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
                        ${hasOlderData
                            ? 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                            : 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        }`}
                >
                    <FiChevronLeft className="w-3 h-3" />
                    <span className="hidden sm:inline">Older</span>
                </motion.button>

                <AnimatePresence mode="wait">
                    <motion.span
                        key={periodLabel}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-medium text-slate-500 dark:text-slate-400"
                    >
                        {periodLabel}
                    </motion.span>
                </AnimatePresence>

                <motion.button
                    onClick={goForward}
                    disabled={!canGoForward}
                    whileTap={canGoForward ? { scale: 0.92 } : {}}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
                        ${canGoForward
                            ? 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                            : 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        }`}
                >
                    <span className="hidden sm:inline">Newer</span>
                    <FiChevronRight className="w-3 h-3" />
                </motion.button>
            </div>

            {/* Grid */}
            <div ref={containerRef} className="w-full">
                {containerWidth === 0 ? (
                    <div className="h-24 flex items-center justify-center">
                        <p className="text-xs text-slate-400">Loading...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={offset}
                            initial={{ opacity: 0, x: animDir * 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: animDir * -24 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            {/* Month labels */}
                            <div
                                className="relative h-5 mb-1"
                                style={{ marginLeft: DAY_LABEL_WIDTH }}
                            >
                                {monthLabels.map(({ label, colIndex }) => (
                                    <span
                                        key={`${label}-${colIndex}`}
                                        className="absolute text-slate-400 select-none"
                                        style={{
                                            left: colIndex * (colWidth + CELL_GAP),
                                            fontSize: 10
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <div className="flex">
                                {/* Day labels — never scroll */}
                                <div
                                    className="flex flex-col flex-shrink-0"
                                    style={{ gap: CELL_GAP, width: DAY_LABEL_WIDTH }}
                                >
                                    {DAYS.map((d, i) => (
                                        <div
                                            key={d}
                                            className="text-slate-400 flex items-center select-none"
                                            style={{
                                                height: cellSize,
                                                fontSize: Math.max(8, cellSize - 4)
                                            }}
                                        >
                                            {/* Only show Mon, Wed, Fri — hide on tiny cells */}
                                            {i % 2 === 0 && cellSize >= 8 ? d : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Week columns — fills remaining width */}
                                {/* Week columns */}
<div className="flex" style={{ gap: CELL_GAP }}>
    {weeks.map((week, wIndex) => (
        <div
            key={wIndex}
            className="flex flex-col flex-shrink-0"
            style={{ gap: CELL_GAP, width: colWidth }}
        >
            {week.map((day, dIndex) => (
                day.isFuture ? (
                    <div
                        key={`pad-${wIndex}-${dIndex}`}
                        style={{ width: colWidth, height: colWidth }}
                    />
                ) : (
                    <motion.div
                        key={day.key}
                        className={`rounded-sm cursor-pointer ${getIntensityColor(day.score)}`}
                        style={{ width: colWidth, height: colWidth }}
                        whileHover={{ scale: 1.3 }}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={() => setTooltip(null)}
                    />
                )
            ))}
        </div>
    ))}
</div>
                            </div>

                            {/* Empty state inside grid area */}
                            {isEmpty && (
                                <p className="text-xs text-center text-slate-400 mt-4">
                                    No activity this period — connect GitHub or start coding!
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs shadow-xl pointer-events-none whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 64,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <p className="font-semibold mb-1">
                        {tooltip.date.toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                    </p>
                    <div className="flex gap-3 text-slate-300">
                        <span>🔨 {tooltip.activity.commits} commits</span>
                        <span>🔀 {tooltip.activity.prs} PRs</span>
                        <span>🚀 {tooltip.activity.releases} releases</span>
                    </div>
                </div>
            )}
        </div>
    )
}