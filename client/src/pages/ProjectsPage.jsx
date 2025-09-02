// src/pages/ProjectsPage.jsx
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';
import ProjectsFilter from '../components/ProjectsFilter';
import NewProjectModal from '../components/NewProjectModal';
import { fetchProjects, createProject, togglePin, importFromGitHub } from '../api/projects';
import { FiPlus, FiStar } from 'react-icons/fi';
import { FaSortAmountDown } from 'react-icons/fa';
import { Menu } from '@headlessui/react';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const data = await fetchProjects({ search: searchTerm, status: selectedStatus, tags: selectedTags, sort: sortOrder });
            setProjects(data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [searchTerm, selectedStatus, selectedTags, sortOrder]);

    const allTags = useMemo(() => {
        const s = new Set();
        projects.forEach(p => (p.tags || []).forEach(t => s.add(t)));
        return Array.from(s);
    }, [projects]);

    const handlePinToggle = async (id) => {
        // optimistic update
        setProjects(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
        try {
            await togglePin(id);
            await load(); // refresh
        } catch (err) {
            console.error(err);
            await load();
        }
    };

    const handleCreateProject = async (data) => {
        const newProj = await createProject(data);
        setProjects(prev => [newProj, ...prev]);
    };

    const handleImportGithub = async (repoUrl) => {
        try {
            const imported = await importFromGitHub(repoUrl);
            setProjects(prev => [imported, ...prev]);
        } catch (err) {
            alert("Import failed. Check the URL.");
        }
    };

    const sortedBy = {
        newest: 'Date: Newest',
        oldest: 'Date: Oldest',
        popularity: 'Popularity',
        alphabetical_asc: 'Title: A-Z',
        alphabetical_desc: 'Title: Z-A'
    };

    return (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Projects</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overview of your tracked projects & repos.</p>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-auto flex items-center gap-2">
                        {/* RESTORED: The professional, beautiful Sorter Dropdown */}
                        <Menu as="div" className="relative flex-grow sm:flex-grow-0">
                            <Menu.Button className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">
                                <FaSortAmountDown className="w-4 h-4 text-slate-400" />
                                <span className="flex-grow text-left">{sortedBy[sortOrder]}</span>
                            </Menu.Button>
                            <AnimatePresence>
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                    <Menu.Items className="absolute right-0 mt-2 w-56 sm:w-full origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                        <div className="py-1">
                                            {Object.keys(sortedBy).map(order => (
                                                <Menu.Item key={order}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => setSortOrder(order)}
                                                            className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200`}
                                                        >
                                                            {sortedBy[order]}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </motion.div>
                            </AnimatePresence>
                        </Menu>

                        {/* Your "New Project" button, with corrected styling from our perfected components */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-transform active:scale-95"
                        >
                            <FiPlus className="w-5 h-5" /> New Project
                        </button>
                    </div>
                </header>

                <div className="mt-6">
                    <ProjectsFilter
                        searchTerm={searchTerm}
                        onSearchChange={e => setSearchTerm(e.target.value)}
                        selectedStatus={selectedStatus}
                        onStatusChange={e => setSelectedStatus(e.target.value)}
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onTagClick={e => {
                            const t = e.target.value;
                            if (t === 'CLEAR_ALL') { setSelectedTags([]); return; }
                            setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
                        }}
                        onClearAll={() => { setSelectedTags([]); setSearchTerm(''); setSelectedStatus('all'); }}
                    />
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {loading ? (
                            new Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg h-44" />)
                        ) : (
                            projects.map(p => <ProjectCard key={p.id} project={p} onPinToggle={handlePinToggle} />)
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateProject={handleCreateProject} onImportGithub={handleImportGithub} />}
            </AnimatePresence>
        </motion.main>
    );
}
