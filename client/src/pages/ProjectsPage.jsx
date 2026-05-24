import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from '../components/ProjectCard'
import ProjectsFilter from '../components/ProjectsFilter'
import NewProjectModal from '../components/NewProjectModal'
import {
    fetchProjects, createProject, togglePin,
    archiveProject, restoreProject, deleteProject
} from '../api/projects'
import { FiPlus, FiArchive } from 'react-icons/fi'

export default function ProjectsPage() {
    const [projects, setProjects] = useState([])
    const [archivedProjects, setArchivedProjects] = useState([])
    const [tab, setTab] = useState('active') // 'active' | 'archived'
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedTags, setSelectedTags] = useState([])
    const [sortOrder, setSortOrder] = useState('newest')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const loadProjects = async () => {
        setLoading(true)
        try {
            const [active, archived] = await Promise.all([
                fetchProjects({ status: 'all' }),
                fetchProjects({ status: 'archived' }),
            ])
            setProjects(active)
            setArchivedProjects(archived)
        } catch (e) {
            console.error('Failed to load projects:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadProjects() }, [])

    // client-side filter + sort
    const displayed = useMemo(() => {
        const source = tab === 'archived' ? archivedProjects : projects
        let list = [...source]

        if (searchTerm) {
            list = list.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        if (selectedStatus !== 'all') {
            list = list.filter(p => p.status === selectedStatus)
        }
        if (selectedTags.length > 0) {
            list = list.filter(p => p.tags?.some(t => selectedTags.includes(t)))
        }

        switch (sortOrder) {
            case 'newest': list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); break
            case 'oldest': list.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)); break
            case 'alphabetical_asc': list.sort((a, b) => a.title.localeCompare(b.title)); break
            case 'alphabetical_desc': list.sort((a, b) => b.title.localeCompare(a.title)); break
            case 'most_coded': list.sort((a, b) => (b.totalSecondsCoded || 0) - (a.totalSecondsCoded || 0)); break
            default: break
        }

        if (tab === 'active') {
            const pinned = list.filter(p => p.isPinned)
            const unpinned = list.filter(p => !p.isPinned)
            return [...pinned, ...unpinned]
        }

        return list
    }, [projects, archivedProjects, tab, searchTerm, selectedStatus, selectedTags, sortOrder])

    const allTags = useMemo(() => {
        const s = new Set()
        projects.forEach(p => (p.tags || []).forEach(t => s.add(t)))
        return Array.from(s)
    }, [projects])

    const handlePinToggle = async (id) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p))
        try {
            await togglePin(id)
        } catch (e) {
            console.error(e)
            loadProjects()
        }
    }

    const handleArchive = async (id) => {
        try {
            await archiveProject(id)
            await loadProjects()
        } catch (e) {
            console.error(e)
        }
    }

    const handleRestore = async (id) => {
        try {
            await restoreProject(id)
            await loadProjects()
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteProject(id)
            await loadProjects()
        } catch (e) {
            console.error(e)
        }
    }

    const handleCreate = async (data) => {
        await createProject(data)
        await loadProjects()
    }

    const sortOptions = {
        newest: 'Newest first',
        oldest: 'Oldest first',
        alphabetical_asc: 'A → Z',
        alphabetical_desc: 'Z → A',
        most_coded: 'Most coded',
    }

    return (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header with Integrated Tabs */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Projects</h1>
                        
                        {/* Compact view toggles/tabs */}
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
                            {[
                                { key: 'active', label: 'Active', count: projects.length },
                                { key: 'archived', label: 'Archived', count: archivedProjects.length },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        tab === t.key
                                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {t.key === 'archived' && <FiArchive className="w-3.5 h-3.5" />}
                                    {t.label}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        tab === t.key
                                            ? 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                    }`}>
                                        {t.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors self-start md:self-auto"
                    >
                        <FiPlus className="w-4 h-4" />
                        New project
                    </button>
                </header>

                {/* Filter and Search Bar */}
                <ProjectsFilter
                    searchTerm={searchTerm}
                    onSearchChange={e => setSearchTerm(e.target.value)}
                    selectedStatus={selectedStatus}
                    onStatusChange={e => setSelectedStatus(e.target.value)}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagClick={e => {
                        const t = e.target.value
                        if (t === 'CLEAR_ALL') { setSelectedTags([]); return }
                        setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
                    }}
                    onClearAll={() => { setSelectedTags([]); setSearchTerm(''); setSelectedStatus('all') }}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    sortOptions={sortOptions}
                />

                {/* Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-48" />
                            ))
                        ) : displayed.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                            >
                                <FiArchive className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {tab === 'archived' ? 'No archived projects' : 'No projects yet'}
                                </p>
                                {tab === 'active' && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-3 text-sm text-blue-600 hover:underline"
                                    >
                                        Create your first project →
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            displayed.map(p => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onPinToggle={handlePinToggle}
                                    onArchive={handleArchive}
                                    onRestore={handleRestore}
                                    onDelete={handleDelete}
                                    onUpdateSuccess={loadProjects}
                                    isArchived={tab === 'archived'}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>

            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <NewProjectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCreateProject={handleCreate}
                        onImportGithub={() => {}}
                    />
                )}
            </AnimatePresence>
        </motion.main>
    )
}