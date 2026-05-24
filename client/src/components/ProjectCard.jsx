import { useState, useRef, useEffect } from 'react'
import { FiClock, FiArrowRight, FiGithub, FiBookmark, FiStar,
         FiMoreVertical, FiArchive, FiTrash2, FiExternalLink, FiEdit2 } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getTagColor, getTagTextColor } from '../utils/tags'
import EditProjectModal from './EditProjectModal'

const formatHours = (seconds) => {
    if (!seconds) return null
    const h = seconds / 3600
    if (h < 1) return `${Math.round(h * 60)}m`
    return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}

const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    const now = new Date()
    const diff = (now - d) / (1000 * 60 * 60 * 24)
    if (diff < 1) return 'today'
    if (diff < 2) return 'yesterday'
    if (diff < 7) return `${Math.floor(diff)}d ago`
    if (diff < 30) return `${Math.floor(diff / 7)}w ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getHealthColor = (lastCommit) => {
    if (!lastCommit) return 'bg-slate-300 dark:bg-slate-600'
    const days = (Date.now() - new Date(lastCommit)) / (1000 * 60 * 60 * 24)
    if (days < 7) return 'bg-emerald-400'
    if (days < 30) return 'bg-amber-400'
    return 'bg-red-400'
}

const getHealthTitle = (lastCommit) => {
    if (!lastCommit) return 'No commits yet'
    const days = (Date.now() - new Date(lastCommit)) / (1000 * 60 * 60 * 24)
    if (days < 7) return 'Active this week'
    if (days < 30) return 'Active this month'
    return 'Going cold'
}

const STATUS_STYLES = {
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

export default function ProjectCard({ project, onPinToggle, onArchive, onDelete, onRestore, isArchived, onUpdateSuccess }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const menuRef = useRef(null)

    const {
        id, title, description, status, tags = [],
        github, totalSecondsCoded, isPinned, liveUrl, gallery = []
    } = project || {}

    // Extract first image preview if available
    const cardPreview = gallery.find(item => item.url)

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
                setConfirming(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handlePin = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onPinToggle?.(id)
    }

    const handleMenuClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(v => !v)
        setConfirming(false)
    }

    const handleEditClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(false)
        setEditModalOpen(true)
    }

    const handleArchive = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(false)
        onArchive?.(id)
    }

    const handleRestore = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(false)
        onRestore?.(id)
    }

    const handleDeleteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setConfirming(true)
    }

    const handleDeleteConfirm = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setMenuOpen(false)
        setConfirming(false)
        onDelete?.(id)
    }

    const hours = formatHours(totalSecondsCoded)

    return (
        <>
            <Link to={`/projects/${id}`}>
                <motion.article
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="group flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                    {/* Visual Media Card Preview */}
                    {cardPreview && (
                        <div className="h-32 w-full overflow-hidden border-b border-slate-100 dark:border-slate-700/50">
                            <img 
                                src={cardPreview.url} 
                                alt={cardPreview.alt || title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}

                    <div className="p-5 flex-grow flex flex-col">

                        {/* Header */}
                        <header className="flex justify-between items-start gap-3 mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                                {github?.lastCommit && (
                                    <div
                                        title={getHealthTitle(github.lastCommit)}
                                        className={`w-2 h-2 rounded-full flex-shrink-0 ${getHealthColor(github.lastCommit)}`}
                                    />
                                )}
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.active}`}>
                                    {status}
                                </span>

                                {!isArchived && (
                                    <button
                                        aria-label={isPinned ? 'Unpin' : 'Pin'}
                                        onClick={handlePin}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <FiBookmark className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                                    </button>
                                )}

                                <div className="relative" ref={menuRef}>
                                    <button
                                        aria-label="Project actions"
                                        onClick={handleMenuClick}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <FiMoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    <AnimatePresence>
                                        {menuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                transition={{ duration: 0.1 }}
                                                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                                            >
                                                <button
                                                    onClick={handleEditClick}
                                                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                >
                                                    <FiEdit2 className="w-4 h-4 text-slate-400" />
                                                    Edit details
                                                </button>

                                                {isArchived ? (
                                                    <button
                                                        onClick={handleRestore}
                                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                    >
                                                        <FiArchive className="w-4 h-4 text-slate-400" />
                                                        Restore project
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleArchive}
                                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                    >
                                                        <FiArchive className="w-4 h-4 text-slate-400" />
                                                        Archive
                                                    </button>
                                                )}

                                                <div className="border-t border-slate-100 dark:border-slate-700">
                                                    {!confirming ? (
                                                        <button
                                                            onClick={handleDeleteClick}
                                                            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    ) : (
                                                        <div className="px-3 py-2">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                                Delete permanently?
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={handleDeleteConfirm}
                                                                    className="flex-1 px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(false) }}
                                                                    className="flex-1 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </header>

                        {/* Description */}
                        {description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                                {description}
                            </p>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                {tags.slice(0, 4).map(t => (
                                    <span
                                        key={t}
                                        style={{ backgroundColor: getTagColor(t), color: getTagTextColor(t) }}
                                        className="px-2 py-0.5 rounded text-xs font-medium"
                                    >
                                        {t}
                                    </span>
                                ))}
                                {tags.length > 4 && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500">
                                        +{tags.length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400 min-w-0">

                            {github?.language && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getTagColor(github.language) }}
                                    />
                                    <span>{github.language}</span>
                                </div>
                            )}

                            {typeof github?.stars === 'number' && github.stars > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <FiStar className="w-3 h-3 text-amber-400" />
                                    <span>{github.stars}</span>
                                </div>
                            )}

                            {hours && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <FiClock className="w-3 h-3" />
                                    <span>{hours}</span>
                                </div>
                            )}

                            {github?.lastCommit && (
                                <span className="truncate">
                                    {formatDate(github.lastCommit)}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {liveUrl && (
                                <a
                                    href={liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-slate-400 hover:text-blue-500 transition-colors"
                                    title="Live demo"
                                >
                                    <FiExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {github?.url && (
                                <a
                                    href={github.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                    title="GitHub repo"
                                >
                                    <FiGithub className="w-3.5 h-3.5" />
                                </a>
                            )}
                            <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-0.5 transform" />
                        </div>
                    </div>
                </motion.article>
            </Link>

            {/* Modal Overlay Injection */}
            <AnimatePresence>
                {editModalOpen && (
                    <EditProjectModal
                        project={project}
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onUpdateSuccess={(updatedProject) => {
                            if (onUpdateSuccess) onUpdateSuccess(updatedProject)
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    )
}