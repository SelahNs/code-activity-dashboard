// src/components/NewProjectModal.jsx

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiGithub, FiPlus, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function NewProjectModal({ isOpen, onClose, onCreateProject, onImportGithub }) {
    const [form, setForm] = useState({
        title: "", description: "", status: "Planned", tags: [], source: "manual",
        repoUrl: "", liveUrl: "", visibility: "public",
    });
    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setForm({ title: "", description: "", status: "Planned", tags: [], source: "manual", repoUrl: "", liveUrl: "", visibility: "public" });
                setTagInput(""); setErrors({}); setLoading(false); setShowAdvanced(false);
            }, 200); // Reset after closing animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    function validate() {
        const e = {};
        if (form.source === "manual") {
            if (!form.title.trim()) e.title = "Project title is required.";
            if (form.title.trim().length < 3) e.title = "Title must be at least 3 characters.";
        } else if (form.source === "github") {
            if (!form.repoUrl.trim()) e.repoUrl = "GitHub repository URL is required.";
            else {
                const m = form.repoUrl.match(/github\.com\/[^\/]+\/[^\/]+/i);
                if (!m) e.repoUrl = "Please provide a valid GitHub repo URL.";
            }
        }
        return e;
    }

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !form.tags.includes(t)) {
            setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
        }
        setTagInput("");
    };

    const removeTag = (tagToRemove) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));

    async function handleSubmit(e) {
        e.preventDefault();
        const eobj = validate();
        setErrors(eobj);
        if (Object.keys(eobj).length > 0) return;

        setLoading(true);
        try {
            if (form.source === "github") {
                await onImportGithub(form.repoUrl.trim());
            } else {
                const payload = { title: form.title.trim(), description: form.description.trim(), status: form.status, tags: form.tags, liveUrl: form.liveUrl || null, visibility: form.visibility };
                await onCreateProject(payload);
            }
            onClose();
        } catch (err) {
            setErrors({ submit: err?.message || "An unexpected error occurred." });
        } finally {
            setLoading(false);
        }
    }

    const inputClasses = (field) => cn(
        "block w-full text-slate-900 dark:text-slate-100 rounded-md border bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        errors[field] ? "border-red-500" : "border-slate-300 dark:border-slate-600"
    );

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => { if (!loading) onClose(); }}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 text-left align-middle shadow-xl border border-slate-200 dark:border-slate-700">
                                <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create a New Project</Dialog.Title>
                                    <button onClick={() => !loading && onClose()} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600" aria-label="Close"><FiX className="w-5 h-5" /></button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="source" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
                                                <select id="source" name="source" value={form.source} onChange={e => setForm(prev => ({ ...prev, source: e.target.value, errors: {} }))} className={inputClasses()}>
                                                    <option value="manual">Create Manually</option>
                                                    <option value="github">Import from GitHub</option>
                                                </select>
                                            </div>
                                            
                                            {form.source === 'github' ? (
                                                <div>
                                                    <label htmlFor="repoUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Repository URL</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiGithub className="h-5 w-5 text-gray-400" /></div>
                                                        <input id="repoUrl" name="repoUrl" value={form.repoUrl} onChange={e => setForm(prev => ({...prev, repoUrl: e.target.value}))} placeholder="github.com/owner/repo" className={cn("pl-10", inputClasses('repoUrl'))} />
                                                    </div>
                                                    <AnimatePresence>{errors.repoUrl && <p className="mt-1 text-xs text-red-600">{errors.repoUrl}</p>}</AnimatePresence>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                                    <select id="status" name="status" value={form.status} onChange={e => setForm(prev => ({...prev, status: e.target.value}))} className={inputClasses()}>
                                                        <option>Planned</option><option>In-progress</option><option>Finished</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {form.source === 'manual' && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Title <span className="text-slate-400">(Required)</span></label>
                                                        <input id="title" name="title" value={form.title} onChange={e => setForm(prev => ({...prev, title: e.target.value}))} className={inputClasses('title')} placeholder="My Awesome Project" />
                                                        <AnimatePresence>{errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}</AnimatePresence>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                                                        <textarea id="description" name="description" value={form.description} rows={3} onChange={e => setForm(prev => ({...prev, description: e.target.value}))} className={inputClasses('description')} placeholder="What this project is about..." />
                                                        <AnimatePresence>{errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}</AnimatePresence>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags / Technologies</label>
                                                        <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                                            {form.tags.map(t => (
                                                                <motion.span key={t} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                                                                    <span>{t}</span>
                                                                    <button type="button" onClick={() => removeTag(t)} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">✕</button>
                                                                </motion.span>
                                                            ))}
                                                            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                                                                className="flex-grow bg-transparent focus:outline-none text-sm text-slate-900 dark:text-slate-100" placeholder="Add tag..." />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        
                                        <div className="pt-4">
                                            <button type="button" onClick={() => setShowAdvanced(s => !s)} className="text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                                                <FiChevronDown className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                                Advanced Settings
                                            </button>
                                            <AnimatePresence>{showAdvanced && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                  <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Live Demo URL<input value={form.liveUrl} onChange={e => setForm(prev => ({ ...prev, liveUrl: e.target.value }))} placeholder="https://demo.example.com" className={cn("mt-1 w-full", inputClasses())} /></label>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Visibility<select value={form.visibility} onChange={e => setForm(prev => ({ ...prev, visibility: e.target.value }))} className={cn("mt-1 w-full sm:w-48", inputClasses())}><option value="public">Public</option><option value="private">Private</option></select></label>
                                                  </div>
                                                </motion.div>
                                            )}</AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="p-6 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                                        <AnimatePresence>{errors.submit && <p className="text-sm text-red-600 mr-auto">{errors.submit}</p>}</AnimatePresence>
                                        <button type="button" onClick={() => !loading && onClose()} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600">Cancel</button>
                                        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                            {loading ? ( <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) 
                                                     : form.source === 'github' ? <><FiGithub className="w-5 h-5"/> Import</> : <>Create Project</>}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}