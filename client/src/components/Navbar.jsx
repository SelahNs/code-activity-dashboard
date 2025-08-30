import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar({ currentPath, user }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const mainNavLinks = [
        { path: "/", label: "Dashboard" },
        { path: "/projects", label: "Projects" },
        { path: "/reports", label: "Reports" },
        { path: "/focus", label: "Focus" },
        { path: "/settings", label: "Settings" },
    ];

    const getLinkClassName = (path, isMobile = false) => {
        const isActive = currentPath === path;
        let classes = `relative z-10 block w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isMobile ? 'text-center text-base' : 'text-left'}`;
        if (isActive) {
            classes += ' text-blue-600 dark:text-blue-400 font-semibold';
        } else {
            classes += ' text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white';
        }
        return classes;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-slate-800 dark:text-slate-200">
                            CodeDash
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <ul className="flex items-center space-x-2">
                                    {mainNavLinks.map(link => (
                                        <li className="relative" key={link.path}>
                                            <Link to={link.path} className={getLinkClassName(link.path)}>
                                                {link.label}
                                            </Link>
                                            {currentPath === link.path && (
                                                <motion.div
                                                    layoutId="navbar-active-pill"
                                                    layout="position"
                                                    className="absolute inset-0 bg-slate-100 dark:bg-slate-700/50 shadow-md rounded-md z-0 will-change-transform"
                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {/* User Menu */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {user.fullName}
                                    </span>
                                </div>
                            </>
                        ) : (
                            // Logged-out Desktop Links
                            <ul className="flex space-x-2">
                                <li><Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Login</Link></li>
                                <li><Link to="/signup" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Sign Up</Link></li>
                            </ul>
                        )}
                    </div>

                    {/* --- THIS IS THE CORRECTED MOBILE TRIGGER --- */}
                    {/* The Hamburger Menu Button is ALWAYS visible on mobile */}
                    <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- THIS IS THE CORRECTED MOBILE MENU DROPDOWN --- */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden"
                    >
                        {user ? (
                            // Logged-in Mobile Links
                            <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200 dark:border-slate-700">
                                {mainNavLinks.map(link => (
                                    <li key={link.path}>
                                        <Link to={link.path} className={getLinkClassName(link.path, true)} onClick={() => setMobileMenuOpen(false)}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            // Logged-out Mobile Links
                            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-slate-200 dark:border-slate-700">
                                <Link to="/login" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                <Link to="/signup" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}