import { useState, useCallback } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return (
        <Sector
            cx={cx} cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    )
}

const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#64748B', '#10B981', '#EF4444']

const processData = (languageMap) => {
    const entries = Object.entries(languageMap)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    if (entries.length === 0) return []

    const total = entries.reduce((sum, e) => sum + e.value, 0)
    const significant = entries.filter(e => e.value / total >= 0.05)
    const small = entries.filter(e => e.value / total < 0.05)
    const otherValue = small.reduce((sum, e) => sum + e.value, 0)
    if (otherValue > 0) return [...significant, { name: 'Other', value: otherValue }]
    return significant
}

const formatValue = (value, mode) => {
    if (mode === 'time') {
        const h = value / 3600
        return h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`
    }
    // bytes
    if (value > 1000000) return `${(value / 1000000).toFixed(1)}MB`
    if (value > 1000) return `${(value / 1000).toFixed(0)}KB`
    return `${value}B`
}

export default function LanguagePieChart({ languageMap = {}, extensionLanguages = {} }) {
    const [activeIndex, setActiveIndex] = useState(null)
    const hasExtension = Object.keys(extensionLanguages).length > 0
    const hasGithub = Object.keys(languageMap).length > 0
    const showToggle = hasExtension && hasGithub

    // default to time if extension data exists, otherwise github
    const [mode, setMode] = useState(hasExtension ? 'time' : 'size')

    const activeMap = mode === 'time' ? extensionLanguages : languageMap
    const chartData = processData(activeMap)
    const total = chartData.reduce((sum, e) => sum + e.value, 0)

    const onPieEnter = useCallback((_, index) => setActiveIndex(index), [])
    const onPieLeave = useCallback(() => setActiveIndex(null), [])
    const activeData = activeIndex !== null ? chartData[activeIndex] : null

    const subtitle = mode === 'time'
        ? 'By time spent — from your editor'
        : 'By codebase size — from GitHub'

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        Languages
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                {showToggle && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
                        <button
                            onClick={() => { setMode('time'); setActiveIndex(null) }}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                                mode === 'time'
                                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            Time
                        </button>
                        <button
                            onClick={() => { setMode('size'); setActiveIndex(null) }}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                                mode === 'size'
                                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            Size
                        </button>
                    </div>
                )}
            </div>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-slate-400">
                        {!hasGithub && !hasExtension
                            ? 'Connect GitHub or install the extension to see your languages.'
                            : 'No language data yet.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-44 h-44 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={52} outerRadius={80}
                                    stroke="none"
                                    paddingAngle={2}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-3">
                            <AnimatePresence mode="wait">
                                {activeData ? (
                                    <motion.div
                                        key="active"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center leading-tight w-full truncate px-1">
                                            {activeData.name}
                                        </span>
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                                            {((activeData.value / total) * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatValue(activeData.value, mode)}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="default"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 text-center leading-tight w-full truncate px-1">
                                            {chartData[0]?.name || '—'}
                                        </span>
                                        <span className="text-xs text-slate-400 mt-0.5">Top language</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full min-w-0">
                        {chartData.map((entry, index) => {
                            const isActive = activeIndex === index
                            return (
                                <motion.div
                                    key={index}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    animate={{ x: isActive ? 4 : 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className={`text-sm truncate transition-colors flex-1 ${
                                        isActive
                                            ? 'text-slate-800 dark:text-slate-100 font-medium'
                                            : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                        {entry.name}
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}