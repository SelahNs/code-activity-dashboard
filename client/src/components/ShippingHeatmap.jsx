// src/components/ShippingHeatmap.jsx
import { useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const getRangeDays = (dateRange) => {
    if (dateRange === 'This Month') return 30
    if (dateRange === 'Last 3 Months') return 90
    if (dateRange === 'This Year') return 365
    return null
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CELL_GAP = 3

const getIntensityColor = (score) => {
    if (score === 0) return 'bg-slate-100 dark:bg-slate-700/50'
    if (score <= 2) return 'bg-blue-200 dark:bg-blue-900'
    if (score <= 5) return 'bg-blue-400 dark:bg-blue-700'
    if (score <= 10) return 'bg-blue-600 dark:bg-blue-500'
    return 'bg-blue-800 dark:bg-blue-400'
}

const buildDays = (dailyActivity, dateRange) => {
    const now = new Date()
    now.setHours(23, 59, 59, 999)

    if (dateRange === 'This Week') {
        const result = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(now.getDate() - i)
            date.setHours(0, 0, 0, 0)
            const key = date.toISOString().split('T')[0]
            const activity = dailyActivity[key] || { commits: 0, prs: 0, releases: 0 }
            const score = activity.commits + (activity.prs * 2) + (activity.releases * 3)
            result.push({ key, date, activity, score, isFuture: false })
        }
        return result
    }

    let startDate
    if (dateRange === 'All Time') {
        const keys = Object.keys(dailyActivity).sort()
        startDate = keys.length > 0 ? new Date(keys[0]) : new Date(now.getTime() - 84 * 86400000)
    } else {
        const numDays = getRangeDays(dateRange)
        startDate = new Date()
        startDate.setDate(now.getDate() - numDays + 1)
    }

    // Rewind to Monday
    const dow = startDate.getDay()
    startDate.setDate(startDate.getDate() - (dow === 0 ? 6 : dow - 1))
    startDate.setHours(0, 0, 0, 0)

    const result = []
    const cursor = new Date(startDate)
    while (cursor <= now) {
        const key = cursor.toISOString().split('T')[0]
        const activity = dailyActivity[key] || { commits: 0, prs: 0, releases: 0 }
        const score = activity.commits + (activity.prs * 2) + (activity.releases * 3)
        result.push({ key, date: new Date(cursor), activity, score, isFuture: false })
        cursor.setDate(cursor.getDate() + 1)
    }

    // Pad to complete last column
    while (result.length % 7 !== 0) {
        result.push({
            key: `pad-${result.length}`,
            date: new Date(cursor),
            activity: { commits: 0, prs: 0, releases: 0 },
            score: 0,
            isFuture: true
        })
        cursor.setDate(cursor.getDate() + 1)
    }

    return result
}

const groupIntoWeeks = (days) => {
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }
    return weeks
}

const getMonthLabels = (weeks) => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, colIndex) => {
        const firstReal = week.find(d => !d.isFuture)
        if (!firstReal) return
        const month = firstReal.date.toLocaleDateString('en-US', { month: 'short' })
        if (month !== lastMonth) {
            labels.push({ month, colIndex })
            lastMonth = month
        }
    })
    return labels
}

export default function ShippingHeatmap({ dailyActivity = {}, dateRange = 'This Week' }) {
    const [tooltip, setTooltip] = useState(null)
    const containerRef = useRef(null)
    const [containerWidth, setContainerWidth] = useState(0)
    const isWeekView = dateRange === 'This Week'

    // Measure container width so we can scale cells to fill it
    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(entries => {
            setContainerWidth(entries[0].contentRect.width)
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const days = useMemo(() => buildDays(dailyActivity, dateRange), [dailyActivity, dateRange])
    const weeks = useMemo(() => isWeekView ? null : groupIntoWeeks(days), [days, isWeekView])
    const monthLabels = useMemo(() => weeks ? getMonthLabels(weeks) : [], [weeks])

    // Day label column is ~30px wide
    const DAY_LABEL_WIDTH = 30
    const availableWidth = containerWidth - DAY_LABEL_WIDTH

    // Calculate cell size — fit all weeks into available width
    // If weeks fit without scrolling, expand cells to fill. If too many weeks, use min size and scroll.
    const MIN_CELL = 10
    const MAX_CELL = 18
    const numWeeks = weeks?.length || 1
    const naturalCellSize = weeks
        ? Math.floor((availableWidth - (numWeeks - 1) * CELL_GAP) / numWeeks)
        : 14
    const cellSize = Math.min(MAX_CELL, Math.max(MIN_CELL, naturalCellSize))

    // If natural size is smaller than min, we need to scroll
    const needsScroll = naturalCellSize < MIN_CELL
    const gridWidth = needsScroll
        ? numWeeks * (MIN_CELL + CELL_GAP)
        : availableWidth

    const handleMouseEnter = (e, day) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top
        const clampedX = Math.max(100, Math.min(x, window.innerWidth - 100))
        setTooltip({ ...day, x: clampedX, y })
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        Shipping Activity
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Commits · PRs merged · Releases
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>Less</span>
                    {[
                        'bg-slate-100 dark:bg-slate-700/50',
                        'bg-blue-200 dark:bg-blue-900',
                        'bg-blue-400 dark:bg-blue-700',
                        'bg-blue-600 dark:bg-blue-500',
                        'bg-blue-800 dark:bg-blue-400'
                    ].map((c, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Content */}
            <div ref={containerRef} className="w-full">
                {isWeekView ? (
                    <div className="flex gap-2">
                        {days.map((day) => (
                            <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-slate-400">
                                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <motion.div
                                    className={`w-full h-12 rounded-lg cursor-pointer ${getIntensityColor(day.score)}`}
                                    whileHover={{ scale: 1.05 }}
                                    onMouseEnter={(e) => handleMouseEnter(e, day)}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                                <span className="text-xs font-mono text-slate-400">
                                    {day.date.getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : containerWidth === 0 ? null : (
                    <div
                        className={needsScroll ? 'overflow-x-auto pb-1' : ''}
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        <div style={{ width: gridWidth + DAY_LABEL_WIDTH }}>
                            {/* Month labels */}
                            <div
                                className="relative h-5 mb-1"
                                style={{ marginLeft: DAY_LABEL_WIDTH }}
                            >
                                {monthLabels.map(({ month, colIndex }) => (
                                    <span
                                        key={`${month}-${colIndex}`}
                                        className="absolute text-xs text-slate-400"
                                        style={{ left: colIndex * (cellSize + CELL_GAP), fontSize: 10 }}
                                    >
                                        {month}
                                    </span>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="flex">
                                {/* Day labels */}
                                <div
                                    className="flex flex-col flex-shrink-0 mr-1"
                                    style={{ gap: CELL_GAP, width: DAY_LABEL_WIDTH - 4 }}
                                >
                                    {DAYS.map((d, i) => (
                                        <div
                                            key={d}
                                            className="text-slate-400 flex items-center justify-end pr-1"
                                            style={{ height: cellSize, fontSize: 9 }}
                                        >
                                            {i % 2 === 0 ? d : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Week columns */}
                                <div className="flex" style={{ gap: CELL_GAP }}>
                                    {weeks.map((week, wIndex) => (
                                        <div
                                            key={wIndex}
                                            className="flex flex-col flex-shrink-0"
                                            style={{ gap: CELL_GAP }}
                                        >
                                            {week.map((day, dIndex) => (
                                                day.isFuture ? (
                                                    <div
                                                        key={`pad-${wIndex}-${dIndex}`}
                                                        style={{ width: cellSize, height: cellSize }}
                                                    />
                                                ) : (
                                                    <motion.div
                                                        key={day.key}
                                                        className={`rounded-sm cursor-pointer ${getIntensityColor(day.score)}`}
                                                        style={{ width: cellSize, height: cellSize }}
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
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs shadow-xl pointer-events-none whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 60,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <p className="font-medium mb-1">
                        {tooltip.date.toLocaleDateString('en-US', {
                            weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                    </p>
                    <div className="flex gap-3 text-slate-300">
                        <span>🔨 {tooltip.activity.commits} commits</span>
                        <span>🔀 {tooltip.activity.prs} PRs</span>
                        <span>🚀 {tooltip.activity.releases} releases</span>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {days.every(d => d.score === 0 || d.isFuture) && (
                <p className="text-xs text-slate-400 mt-2">
                    No shipping activity for this period. Connect GitHub to track your commits, PRs, and releases.
                </p>
            )}
        </div>
    )
}