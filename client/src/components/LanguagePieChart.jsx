// src/components/LanguagePieChart.jsx
import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Helper functions (formatDuration, renderActiveShape) are unchanged...
const formatDuration = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
};

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 8}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

export default function LanguagePieChart({ sessions = [] }) {
    // State and data processing logic is unchanged...
    const [activeIndex, setActiveIndex] = useState(null);
    const totalDuration = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const processData = () => {
        if (totalDuration === 0) return [];
        let langData = Object.entries(sessions.reduce((acc, { language, duration }) => {
            acc[language] = (acc[language] || 0) + duration; return acc;
        }, {})).map(([name, value]) => ({ name, value }));
        langData.sort((a, b) => b.value - a.value);
        const topLangs = langData.slice(0, 4);
        const otherLangsValue = langData.slice(4).reduce((acc, curr) => acc + curr.value, 0);
        if (otherLangsValue > 0) return [...topLangs, { name: 'Other', value: otherLangsValue }];
        return topLangs;
    };
    const chartData = processData();
    
    // --- THE FINAL "PROFESSIONAL & COHESIVE" PALETTE ---
    const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#64748B'];
    // Indigo, Violet, Teal, Orange, Slate (for "Other")
    // ---------------------------------------------------
    
    const onPieEnter = useCallback((_, index) => setActiveIndex(index), [setActiveIndex]);
    const onPieLeave = useCallback(() => setActiveIndex(null), [setActiveIndex]);
    const activeData = activeIndex !== null ? chartData[activeIndex] : null;

    if (chartData.length === 0) {
        return <div className="w-full h-full flex items-center justify-center"><p className="text-slate-500">No language data for this period.</p></div>;
    }

    return (
        // The rest of the component's JSX is unchanged
        <div className="w-full max-w-xl flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-56 h-56 flex-shrink-0">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            stroke="none"
                            paddingAngle={2}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <AnimatePresence initial={false}>
                        {activeData ? (
                            <motion.div key="active-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeData.name}</span>
                                <span className="block text-sm text-slate-500 dark:text-slate-400">
                                    {((activeData.value / totalDuration) * 100).toFixed(0)}%
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div key="total-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                    {formatDuration(totalDuration)}
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">Total</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="w-full md:w-48 flex flex-col gap-2">
                {chartData.map((entry, index) => (
                    <motion.div key={`legend-${index}`} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} className="flex items-center gap-3 cursor-pointer p-2 rounded-md origin-left" animate={{ scale: activeIndex === index ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
                        <span className="ml-auto text-xs font-mono text-slate-400 dark:text-slate-500">{formatDuration(entry.value)}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}