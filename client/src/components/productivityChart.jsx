// src/components/ProductivityChart.jsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'

const formatYAxisTick = (hours) => {
    if (hours === 0) return '0h'
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const currentValue = payload[0].payload.value
        const previousValue = payload[1] ? payload[1].value : null
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
                {previousValue !== null && previousValue > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        vs. {formatYAxisTick(previousValue)} last period
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

export default function ProductivityChart({ sessions, previousSessions = [], dataKey = 'duration' }) {
    const aggregateData = (data) => {
        const aggregated = data.reduce((acc, session) => {
            const date = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!acc[date]) acc[date] = { date, value: 0 }
            // Convert ms to hours for display
            // duration stored as ms from extension
            const rawValue = session[dataKey] || 0
            const inHours = dataKey === 'duration' ? rawValue / 3600000 : rawValue
            acc[date].value += inHours
            return acc
        }, {})
        return Object.values(aggregated).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        )
    }

    const formattedData = aggregateData(sessions)
    const ghostData = aggregateData(previousSessions)

    const combinedData = formattedData.map((current, index) => ({
        ...current,
        previousValue: ghostData[index] ? ghostData[index].value : 0,
    }))

    const average = formattedData.reduce((sum, item) => sum + item.value, 0) / (formattedData.length || 1)

    if (formattedData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                <p className="text-sm text-slate-500">No activity data for this period.</p>
            </div>
        )
    }

    const gradientColor = '#4f46e5'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.6} />
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="ghostGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        dy={8}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={formatYAxisTick}
                        width={35}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: gradientColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Area
                        type="monotone"
                        dataKey="previousValue"
                        stroke="none"
                        fill="url(#ghostGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={gradientColor}
                        strokeWidth={2.5}
                        fill="url(#colorGradient)"
                        activeDot={<CustomActiveDot />}
                        animationDuration={1000}
                    />
                    <ReferenceLine
                        y={average}
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    )
}