// src/components/ProjectsFilter.jsx

import { FiSearch, FiSliders, FiChevronDown } from 'react-icons/fi';
import ProjectTagFilter from './ProjectTagFilter';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from '@headlessui/react'

export default function ProjectsFilter({
    searchTerm, onSearchChange,
    selectedStatus, onStatusChange,
    allTags, selectedTags, onTagClick
}) {
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <div className="mb-8 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Search Bar - now consistent with our auth forms */}
                <div className="relative flex-grow w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="search" value={searchTerm} onChange={onSearchChange}
                        className="block w-full pl-10 pr-3 py-2 text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Search projects..." />
                </div>
                {/* "Filter" button now cleaner */}
                <button onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">
                    <FiSliders className="w-4 h-4" />
                    <span>Filters</span>
                    {(selectedStatus !== 'all' || selectedTags.length > 0) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                </button>
            </div>

            <AnimatePresence>
                {filtersOpen && (
                    <motion.div
                        // We no longer animate height. We animate max-height.
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: '500px' }} // A large enough value
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        // CRUCIALLY, we REMOVE overflow-hidden
                        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Status
                                </label>

                                {/* This is the main Headless UI Menu component */}
                                {/* It needs to be wrapped in a `div` with `relative` for positioning the dropdown */}
                                <Menu as="div" className='relative'>
                                    {/* This is the button the user clicks */}
                                    <Menu.Button
                                        id="status-filter"
                                        className="w-full flex items-center justify-between text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <span>{selectedStatus === 'all' ? 'All Statuses' : selectedStatus}</span>
                                        <FiChevronDown className="w-4 h-4 text-slate-400" />
                                    </Menu.Button>

                                    {/* This is the dropdown panel that appears */}
                                    <Menu.Items className="absolute left-0 mt-2 w-full origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="py-1">
                                            {/* These are the individual, clickable options */}
                                            {['all', 'In-progress', 'Finished', 'Planned'].map(status => (
                                                <Menu.Item key={status}>
                                                    {({ active }) => (
                                                        <button
                                                            // This is how we update the state
                                                            onClick={() => onStatusChange({ target: { value: status } })}
                                                            className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''
                                                                } group flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200`}
                                                        >
                                                            {status === 'all' ? 'All Statuses' : status}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Menu>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
                                <ProjectTagFilter tags={allTags} selectedTags={selectedTags} onTagClick={onTagClick} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}