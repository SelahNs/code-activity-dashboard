import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'

const formatYAxisTick = (hours) => {
    if (hours === 0) return '0h'
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`
}

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const currentValue = payload[0]?.payload?.value ?? 0
        const previousValue = payload[0]?.payload?.previousValue ?? 0
        const label = payload[0]?.payload?.label ?? ''
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="p-3.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"
            >
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
                <div className="flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {formatYAxisTick(currentValue)}
                    </p>
                </div>
                {previousValue > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        vs {formatYAxisTick(previousValue)} previous period
                    </p>
                )}
            </motion.div>
        )
    }
    return null
}

const CustomActiveDot = ({ cx, cy, stroke }) => {
    if (!cx || !cy) return null
    return (
        <g>
            <circle cx={cx} cy={cy} r={10} fill={stroke} fillOpacity={0.2} />
            <circle cx={cx} cy={cy} r={5} fill={stroke} />
        </g>
    )
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getGroupKey = (dateStr, dateRange) => {
    const date = new Date(dateStr)
    if (dateRange === 'This Week') {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    if (dateRange === 'This Month') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    // Last 3 Months, This Year, All Time — group by week
    const day = date.getDay()
    const monday = new Date(date)
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
    return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ProductivityChart({ sessions = [], previousSessions = [], dataKey = 'duration', dateRange = 'This Week' }) {

    const aggregateByKey = (data) => {
        return data.reduce((acc, session) => {
            const key = getGroupKey(session.date, dateRange)
            if (!acc[key]) {
                acc[key] = { label: key, value: 0, originalDate: session.date }
            }
            const rawValue = session[dataKey] || 0
            const inHours = dataKey === 'duration' ? rawValue / 3600000 : rawValue
            acc[key].value += inHours
            return acc
        }, {})
    }

    const currentMap = aggregateByKey(sessions)
    const previousMap = aggregateByKey(previousSessions)

    const currentSorted = Object.values(currentMap).sort((a, b) => {
        if (dateRange === 'This Week') return DAY_ORDER.indexOf(a.label) - DAY_ORDER.indexOf(b.label)
        return new Date(a.originalDate) - new Date(b.originalDate)
    })

    const previousSorted = Object.values(previousMap).sort((a, b) => {
        if (dateRange === 'This Week') return DAY_ORDER.indexOf(a.label) - DAY_ORDER.indexOf(b.label)
        return new Date(a.originalDate) - new Date(b.originalDate)
    })

    const formattedData = currentSorted.map((item, i) => ({
        ...item,
        previousValue: previousSorted[i]?.value ?? 0
    }))

    const average = formattedData.reduce((sum, item) => sum + item.value, 0) / (formattedData.length || 1)
    const hasPreviousData = previousSessions.length > 0 && formattedData.some(d => d.previousValue > 0)

    const maxTicks = {
        'This Week': 7,
        'This Month': 10,
        'Last 3 Months': 12,
        'This Year': 12,
        'All Time': 12
    }[dateRange] ?? 10
    const tickInterval = Math.ceil(formattedData.length / maxTicks)
    const visibleTicks = formattedData
        .filter((_, i) => i % tickInterval === 0 || i === formattedData.length - 1)
        .map(d => d.label)

    if (formattedData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                <p className="text-sm text-slate-500">No activity data for this period.</p>
            </div>
        )
    }

    const gradientColor = '#4f46e5'

    // 3. guard: not enough for a curve
    if (formattedData.length < 4) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-slate-400 text-center">
                    Not enough data for a chart yet —<br />keep coding, it appears after 4 days.
                </p>
                <div className="flex gap-6">
                    {formattedData.map(d => (
                        <div key={d.label} className="text-center">
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                {formatYAxisTick(d.value)}
                            </p>
                            <p className="text-xs text-slate-400">{d.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col"
        >
            <div className='flex-1 min-h-0'>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.6} />
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="ghostGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        dy={8}
                        ticks={visibleTicks}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={formatYAxisTick}
                        width={35}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: gradientColor, strokeWidth: 1, strokeDasharray: '4 4' }} />

                    {hasPreviousData && (
                        <Area
                            type="monotone"
                            dataKey="previousValue"
                            stroke="#f59e0b"
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            strokeOpacity={0.5}
                            fill="url(#ghostGradient)"
                            dot={false}
                            activeDot={{ r: 3, fill: '#f59e0b', fillOpacity: 0.5, strokeWidth: 0 }}
                        />
                    )}

                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={gradientColor}
                        strokeWidth={2.5}
                        fill="url(#colorGradient)"
                        activeDot={<CustomActiveDot />}
                        animationDuration={1000}
                    />

                    <ReferenceLine y={average} stroke="#94a3b8" strokeDasharray="2 5" strokeWidth={1} />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        <div className="flex items-center justify-center gap-4 pt-2 px-1 flex-shrink-0">
            {hasPreviousData && (
                <div className="flex items-center gap-1.5">
                    <svg width="20" height="8">
                        <line x1="0" y1="4" x2="20" y2="4" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3"/>
                    </svg>
                    <span className="text-xs text-slate-400">prev period</span>
                </div>
            )}
            <div className="flex items-center gap-1.5">
                <svg width="20" height="8">
                    <line x1="0" y1="4" x2="20" y2="4" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 5"/>
                </svg>
                <span className="text-xs text-slate-400">avg</span>
            </div>
        </div>
        </motion.div>
    )
}