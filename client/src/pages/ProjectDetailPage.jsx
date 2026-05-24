import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiGithub, FiExternalLink, FiArrowLeft, FiClock,
    FiGitCommit, FiStar, FiGitMerge, FiArchive, FiTrash2,
    FiFileText, FiEye, FiActivity, FiTag, FiImage
} from 'react-icons/fi'
import { getTagColor, getTagTextColor } from '../utils/tags'
import { fetchProjectById, archiveProject, deleteProject } from '../api/projects'
import { apiClient } from '../lib/api'

// Formatting helpers
const formatHours = (s) => {
    if (!s) return '0h'
    const h = s / 3600
    return h < 1 ? `${Math.round(h * 60)}m` : h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}

const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const timeAgo = (d) => {
    if (!d) return '—'
    const diff = (Date.now() - new Date(d)) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    const days = Math.floor(diff / 86400)
    if (days < 7) return `${days}d ago`
    return formatDate(d)
}

const getHealthColor = (lastCommit) => {
    if (!lastCommit) return 'bg-slate-300'
    const days = (Date.now() - new Date(lastCommit)) / (1000 * 60 * 60 * 24)
    if (days < 7) return 'bg-emerald-400'
    if (days < 30) return 'bg-amber-400'
    return 'bg-red-400'
}

export default function ProjectDetailPage() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    
    const [project, setProject] = useState(null)
    const [commits, setCommits] = useState([])
    const [activeImage, setActiveImage] = useState(null)
    const [tab, setTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [commitsLoading, setCommitsLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        fetchProjectById(projectId)
            .then(p => {
                if (!mounted) return
                setProject(p)
                
                // Set initial active image if gallery contains items
                if (p.gallery && p.gallery.length > 0) {
                    setActiveImage(p.gallery[0])
                }

                // Fetch commits if connected to github
                if (p.github?.fullName) {
                    setCommitsLoading(true)
                    apiClient.getProjectCommits(p.github.fullName, 20)
                        .then(data => { if (mounted) setCommits(data) })
                        .catch(() => {})
                        .finally(() => { if (mounted) setCommitsLoading(false) })
                }
            })
            .catch(console.error)
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [projectId])

    const handleArchive = async () => {
        try {
            await archiveProject(projectId)
            navigate('/projects')
        } catch (e) { console.error(e) }
    }

    const handleDelete = async () => {
        try {
            await deleteProject(projectId)
            navigate('/projects')
        } catch (e) { console.error(e) }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">Project not found.</p>
                <Link to="/projects" className="mt-4 inline-block text-blue-600 hover:underline text-sm">Back to projects</Link>
            </div>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview' },
        ...(project.github?.readme ? [{ key: 'readme', label: 'README' }] : []),
        ...(project.github?.fullName ? [{ key: 'commits', label: `Commits${commits.length > 0 ? ` (${commits.length})` : ''}` }] : []),
    ]

    return (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Top Navigation */}
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
                >
                    <FiArrowLeft /> Back to all projects
                </Link>

                {/* Primary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* --- LEFT COLUMN: GALLERY --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="sticky top-24">
                            <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative">
                                {activeImage ? (
                                    <img
                                        src={activeImage.url}
                                        alt={activeImage.alt || `${project.title} preview`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                        <FiImage className="w-12 h-12 mb-2 stroke-[1.5]" />
                                        <span className="text-sm font-medium">No preview available</span>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Thumbnails */}
                            {project.gallery?.length > 1 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {project.gallery.map((item, i) => (
                                        <button
                                          key={i}
                                          onClick={() => setActiveImage(item)}
                                          className={`relative aspect-video rounded-xl overflow-hidden border-2 transition ${
                                            activeImage?.url === item.url
                                              ? 'border-blue-500 shadow-md'
                                              : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                          }`}
                                        >
                                          <div className={`w-full h-full ${activeImage?.url !== item.url ? 'opacity-60 hover:opacity-100' : ''} transition-opacity`}>
                                              <img
                                                  src={item.url}
                                                  alt={`Gallery Thumbnail ${i + 1}`}
                                                  className="w-full h-full object-cover"
                                              />
                                          </div>
                                          {item.type === 'gif' && (
                                              <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                                  GIF
                                              </div>
                                          )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: SIDEBAR DETAILS --- */}
                    <aside className="space-y-6">
                        
                        {/* Title and health state */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {project.github?.lastCommit && (
                                    <div
                                        title={`Last commit ${timeAgo(project.github.lastCommit)}`}
                                        className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${getHealthColor(project.github.lastCommit)}`}
                                    />
                                )}
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                                    {project.title}
                                </h1>
                            </div>

                            {project.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {project.tags.map(t => (
                                        <span
                                            key={t}
                                            style={{ backgroundColor: getTagColor(t), color: getTagTextColor(t) }}
                                            className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Coding & GitHub Statistics Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {formatHours(project.totalSecondsCoded)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coded Time</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {project.github?.stars ?? 0}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                                        <FiStar className="w-3.5 h-3.5 text-amber-400" /> Stars
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {project.github?.forks ?? 0}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                                        <FiGitMerge className="w-3.5 h-3.5" /> Forks
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl flex flex-col justify-center items-center">
                                    <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 capitalize">
                                        {project.status}
                                    </span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                                        Status
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dates details */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                Project Details
                            </h3>
                            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>Visibility</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{project.visibility || 'private'}</span>
                                </div>
                                {project.github?.language && (
                                    <div className="flex justify-between">
                                        <span>Language</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{project.github.language}</span>
                                    </div>
                                )}
                                {project.createdAt && (
                                    <div className="flex justify-between">
                                        <span>Created</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(project.createdAt)}</span>
                                    </div>
                                )}
                                {project.lastActiveDate && (
                                    <div className="flex justify-between">
                                        <span>Last Active</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{timeAgo(project.lastActiveDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action / Resource Links */}
                        {(project.liveUrl || project.docsUrl || project.github?.url) && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
                                <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
                                    Project Links
                                </h3>
                                <div className="space-y-2">
                                    {project.github?.url && (
                                        <a href={project.github.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                                            <FiGithub className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate font-medium">View Repository</span>
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                                            <FiExternalLink className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate font-medium">View Live Demo</span>
                                        </a>
                                    )}
                                    {project.docsUrl && (
                                        <a href={project.docsUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-2 text-sm rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                                            <FiFileText className="w-5 h-5 flex-shrink-0" />
                                            <span className="truncate font-medium">Documentation</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Danger zone actions */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
                                System Actions
                            </h3>
                            <div className="space-y-2">
                                {project.status !== 'archived' && (
                                    <button
                                        onClick={handleArchive}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                                    >
                                        <FiArchive className="w-4 h-4 text-slate-400" />
                                        Archive project
                                    </button>
                                )}
                                {!confirming ? (
                                    <button
                                        onClick={() => setConfirming(true)}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        Delete project
                                    </button>
                                ) : (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                                        <p className="text-xs text-red-700 dark:text-red-300 mb-2 font-medium">
                                            This cannot be undone.
                                            {project.github?.repoId && ' The repo will be blocked from future syncs.'}
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={handleDelete} className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                                                Delete
                                            </button>
                                            <button onClick={() => setConfirming(false)} className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </aside>
                </div>

                {/* --- TABS SYSTEM --- */}
                <div className="mt-12">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="flex gap-6">
                            {tabs.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                                        tab === t.key
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="py-6">
                        <AnimatePresence mode="wait">
                            {tab === 'overview' && (
                                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {project.description ? (
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                            {project.description}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 italic text-sm">No description added yet.</p>
                                    )}

                                    {/* Recent commits preview list inside overview */}
                                    {commits.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                                                <FiActivity className="w-4 h-4" /> Recent repository commits
                                            </h3>
                                            <div className="space-y-3">
                                                {commits.slice(0, 5).map(c => (
                                                    <div key={c._id || c.sha} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                                        <FiGitCommit className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm text-slate-700 dark:text-slate-200 truncate font-medium">{c.message}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs text-slate-400">{timeAgo(c.timestamp)}</span>
                                                                {c.additions > 0 && <span className="text-xs text-emerald-500 font-medium">+{c.additions}</span>}
                                                                {c.deletions > 0 && <span className="text-xs text-red-400 font-medium">-{c.deletions}</span>}
                                                            </div>
                                                        </div>
                                                        {c.url && (
                                                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors flex-shrink-0">
                                                                <FiExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {commits.length > 5 && (
                                                <button onClick={() => setTab('commits')} className="mt-4 text-xs font-semibold text-blue-600 hover:underline">
                                                    View all {commits.length} commits →
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {tab === 'readme' && (
                                <motion.div key="readme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100/50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                            {project.github.readme}
                                        </pre>
                                    </div>
                                </motion.div>
                            )}

                            {tab === 'commits' && (
                                <motion.div key="commits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {commitsLoading ? (
                                        <div className="space-y-3">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="animate-pulse flex gap-3">
                                                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full mt-1" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : commits.length === 0 ? (
                                        <p className="text-slate-400 text-sm">No commits found for this repository.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {commits.map((c, i) => (
                                                <div key={c._id || c.sha} className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5" />
                                                        {i < commits.length - 1 && <div className="w-px flex-1 bg-slate-100 dark:bg-slate-700/50 mt-1" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1 pb-1">
                                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{c.message}</p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="text-xs text-slate-400">{timeAgo(c.timestamp)}</span>
                                                            {c.additions > 0 && <span className="text-xs text-emerald-500 font-medium">+{c.additions}</span>}
                                                            {c.deletions > 0 && <span className="text-xs text-red-400 font-medium">-{c.deletions}</span>}
                                                            <span className="text-xs text-slate-300 dark:text-slate-600 font-mono">{c.sha?.slice(0, 7)}</span>
                                                        </div>
                                                    </div>
                                                    {c.url && (
                                                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors flex-shrink-0">
                                                            <FiExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </motion.main>
    )
}