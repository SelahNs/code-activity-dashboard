import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUsers, FiBell, FiCheckCircle, FiMessageSquare, FiTrendingUp, FiArrowLeft } from 'react-icons/fi'

export default function CommunityPage() {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleNotifyMe = async (e) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        // Simulate an API call
        await new Promise((resolve) => setTimeout(resolve, 800))
        setIsLoading(false)
        setIsSubmitted(true)
        setEmail('')
    }

    // Animation presets
    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.15
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }

    return (
        <motion.main 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center"
        >

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* LEFT Side: Core Text & Call to Action */}
                <div className="lg:col-span-7 space-y-6">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-xs font-semibold tracking-wide">
                        <FiUsers className="w-3.5 h-3.5 animate-pulse" />
                        COMMUNITY PORTAL
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                        Connect, share, and grow <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
                            with fellow developers.
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-300 text-lg max-w-xl leading-relaxed">
                        We are building a collaborative space directly inside your dashboard. Showcase your tracked coding statistics, swap feedback on projects, and discover what other developers are building in real-time.
                    </motion.p>

                    {/* Notification Form / Card */}
                    <motion.div 
                        variants={itemVariants} 
                        className="p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm max-w-lg"
                    >
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form 
                                    key="signup-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleNotifyMe} 
                                    className="space-y-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Get early beta access</h3>
                                        <p className="text-xs text-slate-400">Be the first to know when public community channels go live.</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1 min-w-0 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-75"
                                        >
                                            <FiBell className="w-4 h-4" />
                                            {isLoading ? 'Submitting...' : 'Notify Me'}
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div 
                                    key="success-state"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center text-center py-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3">
                                        <FiCheckCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">You're on the list!</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We'll email you invite credentials as soon as the beta opens.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* RIGHT Side: Preview UI Mockup cards */}
                <div className="lg:col-span-5 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 blur-3xl rounded-full" />
                    
                    <div className="relative space-y-4">
                        {/* Mock Feature Card 1 */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-start gap-4"
                        >
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <FiMessageSquare className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Feature Teaser</span>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Workspace Discussion</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Discuss active code bases, ask for code reviews, and share solutions directly inline.</p>
                            </div>
                        </motion.div>

                        {/* Mock Feature Card 2 */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-start gap-4"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <FiTrendingUp className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Coming Q3 2026</span>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Global Leaderboards</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Opt-in to compare weekly active hours, system additions, and milestones with global teams.</p>
                            </div>
                        </motion.div>

                        {/* Visual background indicator pattern */}
                        <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-slate-100 dark:bg-slate-800/40 rounded-full border border-slate-200 dark:border-slate-700/50 -z-10" />
                    </div>
                </div>

            </div>
        </motion.main>
    )
}