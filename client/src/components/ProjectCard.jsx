// src/components/ProjectCard.jsx
import { FiClock, FiArrowRight, FiGithub, FiExternalLink, FiBookmark, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTagColor, getTagTextColor } from '../utils/tags';
import { formatDateSafe } from '../utils/date';
import TinySparkline from './TinySparkline';

export default function ProjectCard({ project, onPinToggle }) {
    const {
        id, title, description, status, tags = [], githubUrl, liveUrl, lastUpdated, isPinned
    } = project || {};

    const statusStyles = {
        'Finished': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'In-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'Planned': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    };

    const handlePin = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onPinToggle?.(id);
    };

    return (
        <Link to={`/projects/${id}`} aria-label={`Open project ${title}`}>
            <motion.article
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="group flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
            >
                <div className="p-6 flex-grow flex flex-col">
                    <header className="flex justify-between items-start mb-3">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {title}
                        </h3>
                        <div className="flex-shrink-0 flex items-center gap-3">

                            {/* THIS IS THE NEW, HIGH-IMPACT STARS INDICATOR */}
                            {/* It only displays if the `stars` property exists */}
                            {typeof project.stars === 'number' && (
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <FiStar className="w-4 h-4 text-yellow-500" />
                                    <span>{project.stars}</span>
                                </div>
                            )}

                            {/* The status pill */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
                                {status}
                            </span>

                            {/* The pin button */}
                            <button
                                aria-label={isPinned ? "Unpin project" : "Pin project"}
                                aria-pressed={!!isPinned}
                                onClick={handlePin}
                                className="relative z-20 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <FiBookmark className={`w-4 h-4 transition-colors ${isPinned ? 'fill-yellow-400 text-yellow-500' : 'hover:text-slate-600'}`} />
                            </button>
                        </div>
                    </header>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: description }} />

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.map(t => (
                            <span key={t} style={{ backgroundColor: getTagColor(t), color: getTagTextColor(t) }} className="px-2 py-1 rounded text-xs font-medium">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>


                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                        {/* Primary Language */}
                        {project.github?.primaryLanguage && (
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-2 h-2 rounded-full fill"
                                    style={{ backgroundColor: getTagColor(project.github.primaryLanguage) }}
                                ></span>
                                <span>{project.github.primaryLanguage}</span>
                            </div>
                        )}
                        {/* Last Updated */}
                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
                            <FiClock className="w-3 h-3" />
                            <span className="truncate">{formatDateSafe(lastUpdated)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
                        {project.github?.weeklyCommits && <TinySparkline data={project.github.weeklyCommits} />}
                        <FiArrowRight className="w-5 h-5 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" aria-hidden />
                    </div>
                </div>
            </motion.article>
        </Link>
    );
}
