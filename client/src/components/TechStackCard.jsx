import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPackage } from 'react-icons/fi'

const COLORS = ['#4F46E5', '#7C3AED', '#F59E0B', '#EA580C', '#64748B', '#10B981', '#EF4444', '#06B6D4', '#F43F5E', '#84CC16']

const formatTime = (seconds) => {
    if (!seconds) return '0h'
    const h = seconds / 3600
    return h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`
}

export default function TechStackCard({ githubFrameworks = {}, frameworksTime = {} }) {
    const hasGithub = Object.keys(githubFrameworks).length > 0
    const hasTime = Object.keys(frameworksTime).length > 0
    const showToggle = hasGithub && hasTime
    const [mode, setMode] = useState(hasGithub ? 'repos' : 'time')

    const activeMap = mode === 'repos' ? githubFrameworks : frameworksTime

    const sorted = Object.entries(activeMap)
        .filter(([_, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

    const isEmpty = sorted.length === 0

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        Tech Stack
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {mode === 'repos' ? 'Detected across your repos' : 'By time spent in editor'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {showToggle && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
                            <button
                                onClick={() => setMode('repos')}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                                    mode === 'repos'
                                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Repos
                            </button>
                            <button
                                onClick={() => setMode('time')}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                                    mode === 'time'
                                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Time
                            </button>
                        </div>
                    )}
                    {!hasGithub && !hasTime && (
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            Coming soon
                        </span>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isEmpty ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-4 text-center gap-2"
                    >
                        <FiPackage className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {!hasGithub && !hasTime
                                ? 'Connect GitHub or install the extension to detect your stack automatically.'
                                : 'No framework data yet.'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 gap-2"
                    >
                        {sorted.map(([name, value], i) => (
                            <div
                                key={name}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-w-0"
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {mode === 'repos'
                                            ? `${value} ${value === 1 ? 'repo' : 'repos'}`
                                            : formatTime(value)
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}