import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    FiClock, FiZap, FiGitCommit, FiTrendingUp, 
    FiAward, FiShield, FiCpu, FiLayout, FiChevronRight,
    FiCheck, FiTerminal, FiGitBranch, FiGitPullRequest
} from 'react-icons/fi';
import { BsCodeSlash } from 'react-icons/bs';

export default function LandingPage() {
    const [activeDemoTab, setActiveDemoTab] = useState('time'); 

    // Framer Motion presets for clean staggered entries
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 120, damping: 18 } 
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative min-h-screen overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            
            {/* Ambient Background Grid & Glows */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-[0.15] -z-10"
                style={{ 
                    backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`, 
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(ellipse at top, black, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at top, black, transparent 70%)'
                }} 
            />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

            {/* ═══════════════════════════════════
                SECTION 1 — HERO HEADER
            ═══════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 relative">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                >
                    {/* Left Hero Text Side */}
                    <div className="lg:col-span-6 space-y-8 text-left">
                        <motion.div 
                            variants={itemVariants} 
                            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 text-xs font-semibold tracking-wide"
                        >
                            <FiZap className="w-3.5 h-3.5 animate-pulse" />
                            AUTOMATED DEVELOPER ANALYTICS
                        </motion.div>

                        <motion.h1 
                            variants={itemVariants} 
                            className="text-4xl sm:text-[3.5rem] font-extrabold tracking-tight leading-[1.05] text-slate-950 dark:text-slate-50"
                        >
                            Track your coding craft{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-300">
                                on autopilot.
                            </span>
                        </motion.h1>

                        <motion.p 
                            variants={itemVariants} 
                            className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl max-w-xl leading-relaxed font-normal"
                        >
                            CodeDash syncs silently with your favorite IDEs and git environments to automatically map active hours, branch velocity, and your development fingerprint.
                        </motion.p>

                        <motion.div 
                            variants={itemVariants} 
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
                        >
                            <Link 
                                to="/signup" 
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-base font-semibold shadow-lg shadow-indigo-600/10 dark:shadow-none transition-all active:scale-[0.98]"
                            >
                                Start Tracking Free
                                <FiChevronRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                to="/login" 
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-base font-semibold shadow-sm transition-all active:scale-[0.98]"
                            >
                                Existing Account
                            </Link>
                        </motion.div>

                        {/* Security Badge */}
                        <motion.p variants={itemVariants} className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pt-2">
                            <FiShield className="text-emerald-500 dark:text-emerald-400 w-4 h-4" />
                            100% Secure integration • OAuth standard connections • No source code stored
                        </motion.p>
                    </div>

                    {/* Right Interactive Mockup Side */}
                    <motion.div 
                        variants={itemVariants} 
                        className="lg:col-span-6 relative"
                    >
                        {/* Interactive Wrapper Dashboard */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden text-left relative">
                            
                            {/* Window Topbar Controls */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                                </div>
                                <div className="flex bg-slate-200/50 dark:bg-slate-800/70 p-0.5 rounded-lg text-xs font-semibold gap-0.5 border border-slate-200/20">
                                    {[
                                        { key: 'time', label: 'Coding Time' },
                                        { key: 'git', label: 'Git Velocity' },
                                        { key: 'archetype', label: 'Archetype' }
                                    ].map(t => (
                                        <button 
                                            key={t.key}
                                            onClick={() => setActiveDemoTab(t.key)}
                                            className={`px-3 py-1.5 rounded-md transition-all ${
                                                activeDemoTab === t.key 
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Window Dashboard Panel Render */}
                            <div className="p-6 h-[290px] flex flex-col justify-center bg-white dark:bg-slate-900/90">
                                <AnimatePresence mode="wait">
                                    
                                    {/* Tab 1: Coding Time */}
                                    {activeDemoTab === 'time' && (
                                        <motion.div 
                                            key="time-demo"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4 w-full"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Today's Session</p>
                                                    <h4 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">4h 12m</h4>
                                                </div>
                                                <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
                                                    <span>+12% vs yesterday</span>
                                                </div>
                                            </div>

                                            {/* Language Breakdown */}
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-medium">TypeScript</span>
                                                        <span className="font-bold">2h 30m (59%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: '59%' }} transition={{ duration: 0.6 }} className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-medium">Rust</span>
                                                        <span className="font-bold">1h 42m (41%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: '41%' }} transition={{ duration: 0.6 }} className="bg-blue-500 dark:bg-blue-400 h-full rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Tab 2: Git Velocity */}
                                    {activeDemoTab === 'git' && (
                                        <motion.div 
                                            key="git-demo"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4 w-full"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Commits</p>
                                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1 flex items-center gap-1.5">
                                                        <FiGitBranch className="text-indigo-500 w-5 h-5" />
                                                        214
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-1">Across 8 active repos</p>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Avg PR Merge Rate</p>
                                                    <p className="text-2xl font-bold text-slate-950 dark:text-slate-50 mt-1 flex items-center gap-1.5">
                                                        <FiGitPullRequest className="text-emerald-500 w-5 h-5" />
                                                        92.4%
                                                    </p>
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Fastest merge: 14m</p>
                                                </div>
                                            </div>

                                            {/* Active Status Display */}
                                            <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/30 text-xs text-slate-500 dark:text-slate-400">
                                                <FiTerminal className="text-indigo-500 w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">Active: <code className="text-slate-850 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 rounded">dashboard-v2-migration</code></span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Tab 3: Archetype Profile */}
                                    {activeDemoTab === 'archetype' && (
                                        <motion.div 
                                            key="archetype-demo"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4 w-full"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-indigo-100/50 dark:border-indigo-900/20">
                                                    🏃
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Developer Signature</p>
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50">The Marathoner</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Characterized by sustained coding streaks and long deep-work focus windows.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                {[
                                                    { label: 'Consistency', val: '94%' },
                                                    { label: 'Deep Work', val: '86%' },
                                                    { label: 'Night Owl', val: '12%' }
                                                ].map(metric => (
                                                    <div key={metric.label} className="text-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                                        <span className="block text-sm font-bold text-slate-900 dark:text-slate-200">{metric.val}</span>
                                                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{metric.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ═══════════════════════════════════
                SECTION 2 — PROOF POINTS BANNER
            ═══════════════════════════════════ */}
            <section className="bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80 py-10 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800/80 text-center">
                        {[
                            { value: '1.2M+', label: 'Seconds tracked' },
                            { value: '99.8%', label: 'Uptime reliability' },
                            { value: '0 secs', label: 'Manual entry needed' },
                            { value: '100%', label: 'Strictly data private' }
                        ].map((stat, i) => (
                            <div key={stat.label} className={`${i > 1 ? 'pt-6 md:pt-0' : ''} md:px-4`}>
                                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1.5 font-semibold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════
                SECTION 3 — CORE FEATURES GRID
            ═══════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
                        Built entirely for modern developer workflows.
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto">
                        Get granular, action-focused metrics without complicating your dev cycle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <FiClock className="w-5 h-5 text-indigo-500" />,
                            title: 'Silent Extension Sync',
                            desc: 'Our light IDE extension monitors coding duration quietly, compiling interaction statistics without ever slowing down your machine.'
                        },
                        {
                            icon: <FiGitCommit className="w-5 h-5 text-indigo-500" />,
                            title: 'GitHub Workspace Integrations',
                            desc: 'Map your pull request schedules, commit velocities, merge distributions, documentation scores, and package releases.'
                        },
                        {
                            icon: <FiTrendingUp className="w-5 h-5 text-indigo-500" />,
                            title: 'Gamified Growth & Streaks',
                            desc: 'Lock in XP benchmarks and keep your consecutive days streak active. Levels are dynamic, reflecting your consistency.'
                        },
                        {
                            icon: <FiAward className="w-5 h-5 text-indigo-500" />,
                            title: 'Signature Fingerprint Profiles',
                            desc: 'Unlock and understand your stylistic archetypes computed dynamically based on file interaction types and system revisions.'
                        },
                        {
                            icon: <FiCpu className="w-5 h-5 text-indigo-500" />,
                            title: 'Evolution Matrices',
                            desc: 'Inspect shifting platform behaviors, stack transitions, and peak workspace efficacy across historical timeline maps.'
                        },
                        {
                            icon: <FiLayout className="w-5 h-5 text-indigo-500" />,
                            title: 'Command Hub View',
                            desc: 'A gorgeous control layout with dark and light variants, customizable layout filters, and fast navigation controls.'
                        }
                    ].map(f => (
                        <div 
                            key={f.title}
                            className="p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-500/20 dark:hover:border-indigo-500/10 group text-left flex flex-col justify-between"
                        >
                            <div>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300 border border-indigo-100/10 dark:border-indigo-900/10">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-5">{f.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════
                SECTION 4 — FINAL CALL TO ACTION
            ═══════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
                <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800/80 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-xl">
                    
                    {/* Visual accent backdrop */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

                    <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                        <BsCodeSlash className="w-10 h-10 text-indigo-400 mx-auto" />
                        
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Elevate your workspace visibility today.
                        </h2>
                        
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Initialize your account details, bind your active configurations, and analyze your development timeline in minutes. Absolutely no credit card or payment configuration required.
                        </p>
                        
                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                to="/signup" 
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold shadow-lg shadow-indigo-600/10 transition-all active:scale-[0.98]"
                            >
                                Get Started Free
                            </Link>
                            <Link 
                                to="/login" 
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-base font-semibold border border-slate-700/80 transition-all active:scale-[0.98]"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Additional value propositions under buttons */}
                        <div className="pt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <FiCheck className="text-indigo-400" /> Free tier forever
                            </span>
                            <span className="flex items-center gap-1">
                                <FiCheck className="text-indigo-400" /> Easy 2-minute setup
                            </span>
                            <span className="flex items-center gap-1">
                                <FiCheck className="text-indigo-400" /> Cancel anytime
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}