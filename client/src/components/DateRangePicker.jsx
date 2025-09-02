// src/components/DateRangePicker.jsx
import { useState } from 'react';
import { FiCalendar, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ranges = ['This Week', 'This Month', 'All Time'];

export default function DateRangePicker({ selectedRange, onRangeChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (range) => {
        onRangeChange(range);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <FiCalendar className="w-4 h-4 text-slate-400" />
                <span>{selectedRange}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10"
                    >
                        <ul className="py-1">
                            {ranges.map((range) => (
                                <li key={range}>
                                    <button
                                        onClick={() => handleSelect(range)}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                                    >
                                        <span>{range}</span>
                                        {selectedRange === range && <FiCheck className="w-4 h-4 text-blue-600" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}