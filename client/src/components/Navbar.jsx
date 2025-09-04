// src/components/Navbar.jsx

import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FiMenu, FiX, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { BsCodeSlash } from 'react-icons/bs';

export default function Navbar({ user, onLogout }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const location = useLocation();
    const currentPath = location.pathname;

    // --- RESTORED: All 5 navigation links are back ---
    const mainNavLinks = [
        { path: "/", label: "Dashboard" },
        { path: "/projects", label: "Projects" },
        { path: "/reports", label: "Reports" },
        { path: "/focus", label: "Focus" },
        { path: "/goals", label: "Goals" },
    ];
    
    // --- RESTORED: Your original function for link styling ---
    const getLinkClassName = (path, isMobile = false) => {
        const isActive = currentPath === path;
        let classes = `relative z-10 block w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${isMobile ? 'text-center text-base' : 'text-left'}`;
        if (isActive) {
            // Active link text is now slightly bolder and more prominent
            classes += ' text-blue-600 dark:text-blue-400 font-semibold';
        } else {
            classes += ' text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white';
        }
        return classes;
    };

    // Close profile dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileMenuRef]);

    return (
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-200">
                        <BsCodeSlash className="text-blue-600 dark:text-blue-500" />
                        <span>CodeDash</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                {/* --- RESTORED: Your original nav link style --- */}
                                <ul className="flex items-center space-x-2">
                                    {mainNavLinks.map(link => (
                                        <li className="relative" key={link.path}>
                                            <Link to={link.path} className={getLinkClassName(link.path)}>
                                                {link.label}
                                            </Link>
                                            {currentPath === link.path && (
                                                <motion.div
                                                    layoutId="navbar-active-pill"
                                                    className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-md z-0 shadow-sm"
                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {/* --- REFINED: The improved profile dropdown --- */}
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setProfileMenuOpen(p => !p)}
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <FiUser className="w-5 h-5" />
                                    </button>
                                    <AnimatePresence>
                                        {profileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link to="/settings" className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60" onClick={() => setProfileMenuOpen(false)}>
                                                        <FiSettings className="w-4 h-4" />
                                                        <span>Account Settings</span>
                                                    </Link>
                                                </div>
                                                <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                                                    <button onClick={() => { onLogout(); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                        <FiLogOut className="w-4 h-4" />
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            // Logged-out Desktop Links
                            <ul className="flex items-center space-x-2">
                                <li><Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Login</Link></li>
                                <li><Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Sign Up</Link></li>
                            </ul>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(p => !p)} className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- REFINED: The improved Mobile Menu --- */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200 dark:border-slate-700">
                            {user ? (
                                <>
                                    {mainNavLinks.map(link => (
                                        <li key={link.path} className="list-none">
                                            <Link to={link.path} className={getLinkClassName(link.path, true)} onClick={() => setMobileMenuOpen(false)}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                                        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                                        <Link to="/settings" className={getLinkClassName('/settings', true)} onClick={() => setMobileMenuOpen(false)}>
                                            Settings
                                        </Link>
                                        <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-center px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                    <Link to="/signup" className="block text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}