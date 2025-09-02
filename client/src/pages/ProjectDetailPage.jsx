// src/pages/ProjectDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGithub,
  FiExternalLink,
  FiFileText,
  FiArrowLeft,
} from "react-icons/fi";
import { getTagColor, getTagTextColor } from "../utils/tags";
import { formatDateSafe } from "../utils/date";
import { fetchProjectById } from "../api/projects";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [tab, setTab] = useState("activity");

  useEffect(() => {
    let mounted = true;
    fetchProjectById(projectId)
      .then((p) => {
        if (mounted) {
          setProject(p);
          setActiveImage(p.gallery?.[0] || null);
        }
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading project...
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-8"
        >
          <FiArrowLeft /> Back to all projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN: GALLERY --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24">
              <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt || `${project.title} screenshot`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No preview
                  </div>
                )}
              </div>

              {project.gallery?.length > 1 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {project.gallery.map((item, i) => (
                    <button
                      key={i}
                      aria-label={`Preview ${i + 1}`}
                      onClick={() => setActiveImage(item)}
                      className={`relative aspect-video rounded-md overflow-hidden border-2 transition ${
                        activeImage?.url === item.url
                          ? "border-blue-500"
                          : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div
                        className={`w-full h-full ${
                          activeImage?.url !== item.url
                            ? "opacity-60 hover:opacity-100"
                            : ""
                        } transition-opacity`}
                      >
                        <img
                          src={item.url}
                          alt={`Gallery ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {item.type === "gif" && (
                        <div className="absolute top-1 right-1 bg-black/50 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          GIF
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {project.title}
            </h1>

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      backgroundColor: getTagColor(t),
                      color: getTagTextColor(t),
                    }}
                    className="px-2 py-1 rounded text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Statistics
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {project.github?.stars ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Stars
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {project.github?.forks ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Forks
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {project.meta?.impactScore ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Impact
                  </div>
                </div>
                <div>
                  <div
                    className={`text-lg font-bold ${
                      project.meta?.maintenance === "Active"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {project.meta?.maintenance || "Unknown"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Status
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              {project.createdAt && (
                <p>Created: {formatDateSafe(project.createdAt)}</p>
              )}
              {project.updatedAt && (
                <p>Last Updated: {formatDateSafe(project.updatedAt)}</p>
              )}
            </div>

            {/* Links */}
            {(project.githubUrl || project.liveUrl || project.docsUrl) && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Project Links
                </h4>
                <div className="space-y-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600"
                    >
                      <FiGithub className="w-5 h-5 flex-shrink-0" />{" "}
                      <span className="truncate">View Repository</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600"
                    >
                      <FiExternalLink className="w-5 h-5 flex-shrink-0" />{" "}
                      <span className="truncate">View Live Demo</span>
                    </a>
                  )}
                  {project.docsUrl && (
                    <a
                      href={project.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600"
                    >
                      <FiFileText className="w-5 h-5 flex-shrink-0" />{" "}
                      <span className="truncate">Documentation</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </div>

        {/* --- TABS --- */}
        <div className="mt-12">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex gap-6" aria-label="Tabs">
              {["activity", "readme", "issues"].map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            <AnimatePresence mode="wait">
              {tab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Activity data (commits, VS Code active time) will appear
                    here once your backend aggregates it.
                  </p>
                </motion.div>
              )}
              {tab === "readme" && (
                <motion.div
                  key="readme"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
              {tab === "issues" && (
                <motion.div
                  key="issues"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Open issues and PRs summary (fetched from GitHub when
                    available).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
