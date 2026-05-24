import { FiSearch, FiSliders, FiChevronDown } from 'react-icons/fi'
import ProjectTagFilter from './ProjectTagFilter'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from '@headlessui/react'

export default function ProjectsFilter({
    searchTerm, onSearchChange,
    selectedStatus, onStatusChange,
    allTags, selectedTags, onTagClick, onClearAll,
    sortOrder, onSortChange, sortOptions
}) {
    const [filtersOpen, setFiltersOpen] = useState(false)
    const hasActiveFilters = selectedStatus !== 'all' || selectedTags.length > 0

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">

                {/* Search */}
                <div className="relative flex-grow w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Sort */}
                <Menu as="div" className="relative flex-shrink-0 w-full sm:w-auto">
                    <Menu.Button className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <span>{sortOptions?.[sortOrder] || 'Sort'}</span>
                        <FiChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                        {Object.entries(sortOptions || {}).map(([key, label]) => (
                            <Menu.Item key={key}>
                                {({ active }) => (
                                    <button
                                        onClick={() => onSortChange(key)}
                                        className={`w-full text-left px-3 py-2 text-sm ${
                                            active ? 'bg-slate-50 dark:bg-slate-700' : ''
                                        } ${sortOrder === key
                                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                                            : 'text-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </Menu.Items>
                </Menu>

                {/* Filter toggle */}
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        hasActiveFilters
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <FiSliders className="w-4 h-4" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                </button>
            </div>

            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Status</label>
                                <Menu as="div" className="relative">
                                    <Menu.Button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg">
                                        <span>{selectedStatus === 'all' ? 'All statuses' : selectedStatus}</span>
                                        <FiChevronDown className="w-4 h-4 text-slate-400" />
                                    </Menu.Button>
                                    <Menu.Items className="absolute left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                                        {['all', 'active', 'completed'].map(s => (
                                            <Menu.Item key={s}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => onStatusChange({ target: { value: s } })}
                                                        className={`w-full text-left px-3 py-2 text-sm ${active ? 'bg-slate-50 dark:bg-slate-700' : ''} ${selectedStatus === s ? 'text-blue-600 font-medium' : 'text-slate-700 dark:text-slate-200'}`}
                                                    >
                                                        {s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Items>
                                </Menu>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Tags</label>
                                <ProjectTagFilter tags={allTags} selectedTags={selectedTags} onTagClick={onTagClick} />
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={onClearAll}
                                className="mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}