// src/components/LanguagePieChart.jsx
import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx} cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

export default function LanguagePieChart({ languageMap = {} }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const processData = () => {
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

    const chartData = processData()
    const totalDuration = chartData.reduce((sum, e) => sum + e.value, 0)
    const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#64748B']

    const onPieEnter = useCallback((_, index) => setActiveIndex(index), [])
    const onPieLeave = useCallback(() => setActiveIndex(null), [])
    const activeData = activeIndex !== null ? chartData[activeIndex] : null

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                    Languages
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    Based on your GitHub repositories
                </p>
            </div>

            {chartData.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-slate-400">
                        No language data yet. Connect GitHub to see your stack.
                    </p>
                </div>
            ) : (
                <div className="flex max-w-sm mx-auto flex-col sm:flex-row items-center gap-6">
                    {/* Donut chart */}
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
                                            {((activeData.value / totalDuration) * 100).toFixed(0)}%
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
                                        <span className="text-xs text-slate-400 mt-0.5">
                                            Top Language
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Legend — name only, no percentage */}
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
                                    <span className={`text-sm truncate transition-colors ${
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