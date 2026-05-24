import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiGithub, FiLink2, FiImage, FiPlus, FiTrash2, FiGlobe, FiFileText, FiSearch } from 'react-icons/fi'
import { apiClient } from '../lib/api' // Adjust this import path to match your folder structure

export default function EditProjectModal({ project, isOpen, onClose, onUpdateSuccess }) {
    const [activeTab, setActiveTab] = useState('general') // 'general' | 'github' | 'media'
    const [saving, setSaving] = useState(false)
    
    // General details state
    const [title, setTitle] = useState(project.title || '')
    const [description, setDescription] = useState(project.description || '')
    const [status, setStatus] = useState(project.status || 'active')
    const [liveUrl, setLiveUrl] = useState(project.liveUrl || '')
    const [docsUrl, setDocsUrl] = useState(project.docsUrl || '')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState(project.tags || [])

    // GitHub sync states
    const [isLinked, setIsLinked] = useState(!!project.github?.fullName)
    const [githubRepoName, setGithubRepoName] = useState(project.github?.fullName || '')
    const [availableRepos, setAvailableRepos] = useState([])
    const [reposLoading, setReposLoading] = useState(false)
    const [repoSearchTerm, setRepoSearchTerm] = useState('')

    // Media and gallery states
    const [gallery, setGallery] = useState(project.gallery || [])
    const fileInputRef = useRef(null)

    // Load available GitHub repositories if they aren't linked yet
    useEffect(() => {
        if (isOpen && activeTab === 'github' && !isLinked) {
            setReposLoading(true)
            apiClient.getRepos()
                .then(data => {
                    setAvailableRepos(data || [])
                })
                .catch(err => {
                    console.error("Failed to fetch available GitHub repositories:", err)
                })
                .finally(() => {
                    setReposLoading(false)
                })
        }
    }, [isOpen, activeTab, isLinked])

    // Handle Tag logic
    const handleAddTag = (e) => {
        e.preventDefault()
        const cleanTag = tagInput.trim()
        if (cleanTag && !tags.includes(cleanTag)) {
            setTags([...tags, cleanTag])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    // Handle GitHub Link via existing backend PATCH endpoint
    const handleLinkRepo = async (repo) => {
        // 1. Defensively look up the ID across multiple possible keys
        const rawId = repo.id !== undefined ? repo.id : (repo.repoId !== undefined ? repo.repoId : repo._id);
        const repoId = Number(rawId);

        // 2. Prevent sending undefined/NaN to your Mongoose model to avoid the ERR_ASSERTION error
        if (rawId === undefined || isNaN(repoId)) {
            console.error(
                "Could not identify a valid numeric repository ID. Here is the inspected repo object:", 
                repo
            );
            alert("Unable to find a valid repository ID. Please see your browser console logs for debugging.");
            return;
        }

        setSaving(true)
        try {
            // Send the validated Number directly to your backend endpoint
            const updatedProject = await apiClient.linkGithub(project.id, repoId)
            setIsLinked(true)
            setGithubRepoName(repo.full_name)
            if (onUpdateSuccess) onUpdateSuccess(updatedProject)
        } catch (err) {
            console.error("Failed to link repository:", err)
            alert(err.data?.error || "Failed to link repository.")
        } finally {
            setSaving(false)
        }
    }

    // Handle GitHub Unlink via existing backend PATCH endpoint
    const handleUnlinkRepo = async (e) => {
        e.preventDefault()
        if (!window.confirm("Are you sure you want to unlink this GitHub repository? This will clear all repository data.")) return
        setSaving(true)
        try {
            const updatedProject = await apiClient.unlinkGithub(project.id)
            setIsLinked(false)
            setGithubRepoName('')
            if (onUpdateSuccess) onUpdateSuccess(updatedProject)
        } catch (err) {
            console.error("Failed to unlink repository:", err)
            alert("Failed to unlink repository.")
        } finally {
            setSaving(false)
        }
    }

    // Handle Image/GIF conversions to Base64 locally for saving inside the gallery array
    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const fileType = file.type.includes('gif') ? 'gif' : 'image'
        const reader = new FileReader()
        
        reader.onloadend = () => {
            const newMedia = {
                url: reader.result, // Local Base64 representation
                alt: file.name,
                type: fileType
            }
            setGallery([...gallery, newMedia])
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveMedia = (indexToRemove) => {
        setGallery(gallery.filter((_, idx) => idx !== indexToRemove))
    }

    // Handle General PUT saving details
    const handleSaveGeneralDetails = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                title,
                description,
                status,
                tags,
                liveUrl,
                docsUrl,
                gallery
            }
            const updatedProject = await apiClient.updateProject(project.id, payload)
            if (onUpdateSuccess) onUpdateSuccess(updatedProject)
            onClose()
        } catch (err) {
            console.error("Failed to save project details:", err)
            alert(err.data?.error || "Failed to update project details.")
        } finally {
            setSaving(false)
        }
    }

    // Filter loaded repos list
    const filteredRepos = availableRepos.filter(repo => 
        repo.name?.toLowerCase().includes(repoSearchTerm.toLowerCase()) ||
        repo.full_name?.toLowerCase().includes(repoSearchTerm.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Project Details</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Configure project details, connect live repositories, and upload media.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </header>

                {/* Tab Navigation Controls */}
                <div className="flex border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-6 py-2 gap-4">
                    {[
                        { id: 'general', label: 'General', icon: <FiLink2 className="w-4 h-4" /> },
                        { id: 'github', label: 'GitHub Sync', icon: <FiGithub className="w-4 h-4" /> },
                        { id: 'media', label: 'Media Gallery', icon: <FiImage className="w-4 h-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-blue-500 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Inner Form Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    
                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    maxLength={2000}
                                    rows={4}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                                        <FiGlobe className="w-3.5 h-3.5" /> Live Demo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={liveUrl}
                                        onChange={(e) => setLiveUrl(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://your-demo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                                    <FiFileText className="w-3.5 h-3.5" /> Documentation URL
                                </label>
                                <input
                                    type="url"
                                    value={docsUrl}
                                    onChange={(e) => setDocsUrl(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://docs.your-project.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Project Tags</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        placeholder="Add tag (e.g. React)"
                                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag(e);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddTag}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-1"
                                    >
                                        <FiPlus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {tags.map(t => (
                                        <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            {t}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTag(t)}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- GITHUB SYNC TAB --- */}
                    {activeTab === 'github' && (
                        <div className="space-y-4">
                            {isLinked ? (
                                <div className="p-5 border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                            <FiGithub className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Repository Linked</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{githubRepoName}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        This project is linked directly to your GitHub repository. Commit schedules, forks, stars, and language statistics are tracked in real-time.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleUnlinkRepo}
                                        className="px-3.5 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'Unlinking...' : 'Unlink Repository'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-5 border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                                            <FiGithub className="w-4 h-4" /> Link GitHub Repository
                                        </h3>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                            Link a repository to automatically populate languages, stars, commit logs, and documentation index readme files.
                                        </p>
                                        
                                        {/* Repo List Filter / Selector */}
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <FiSearch className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search your GitHub repositories..."
                                                    value={repoSearchTerm}
                                                    onChange={(e) => setRepoSearchTerm(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                                                />
                                            </div>

                                            {reposLoading ? (
                                                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                                                    Fetching your repositories...
                                                </div>
                                            ) : filteredRepos.length === 0 ? (
                                                <div className="py-8 text-center text-xs text-slate-400">
                                                    No repositories found.
                                                </div>
                                            ) : (
                                                <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-700/50 rounded-lg divide-y divide-slate-100 dark:divide-slate-700/50">
                                                    {filteredRepos.map(repo => {
                                                        const targetId = repo.id !== undefined ? repo.id : (repo.repoId !== undefined ? repo.repoId : repo._id);
                                                        return (
                                                            <div 
                                                                key={targetId} 
                                                                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{repo.full_name}</p>
                                                                    {repo.language && <span className="text-[10px] text-slate-400">{repo.language}</span>}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    disabled={saving}
                                                                    onClick={() => handleLinkRepo(repo)}
                                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-md transition-colors disabled:opacity-50"
                                                                >
                                                                    {saving ? 'Linking...' : 'Link'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- MEDIA TAB --- */}
                    {activeTab === 'media' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Visual Media & Previews</h4>
                                <p className="text-xs text-slate-400 mt-0.5 mb-4">Upload screenshot images or working loop GIFs to be showcased on your project cards.</p>
                                
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/10"
                                     onClick={() => fileInputRef.current?.click()}
                                >
                                    <FiImage className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Click to upload Media</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, or animated GIFs</span>
                                    
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden" 
                                    />
                                </div>
                            </div>

                            {/* Previews of uploaded media list */}
                            {gallery.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-xs font-semibold text-slate-500 uppercase">Uploaded Files ({gallery.length})</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        {gallery.map((item, index) => (
                                            <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-24">
                                                <img 
                                                    src={item.url} 
                                                    alt={item.alt || "Uploaded file"} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md cursor-pointer hover:bg-red-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                     onClick={() => handleRemoveMedia(index)}
                                                >
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 p-1 text-[10px] text-white truncate text-center font-mono">
                                                    {item.type || 'image'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/40">
                    <button 
                        type="button"
                        disabled={saving}
                        onClick={onClose} 
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    {activeTab === 'general' || activeTab === 'media' ? (
                        <button 
                            type="button"
                            disabled={saving}
                            onClick={handleSaveGeneralDetails}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    ) : null}
                </footer>
            </motion.div>
        </div>
    )
}