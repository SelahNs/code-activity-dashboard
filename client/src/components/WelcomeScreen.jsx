import { motion } from 'framer-motion'
import { FiGithub, FiCode, FiZap, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Step = ({ icon, title, description, action, actionLabel, done, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className={`relative flex gap-4 p-5 rounded-xl border transition-all ${
            done
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}
    >
        <div className={`p-2.5 rounded-lg flex-shrink-0 h-fit ${
            done
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {title}
                </h3>
                {done && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                        Connected
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                {description}
            </p>
            {!done && (
                typeof action === 'string' && action.startsWith('http') ? (
                    <a
                        href={action}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-slate-200 dark:text-slate-800 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        {actionLabel} →
                    </a>
                ) : (
                    <Link
                        to={action}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 dark:bg-slate-200 dark:text-slate-800 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        {actionLabel} →
                    </Link>
                )
            )}
        </div>
    </motion.div>
)

const Feature = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
    >
        <div className="text-indigo-500 flex-shrink-0 mt-0.5">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-0.5">{title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        </div>
    </motion.div>
)

export default function WelcomeScreen({ user, hasGitHub, hasExtension }) {
    const firstName = user?.profile?.fullName?.split(' ')[0] || user?.username || 'there'
    const bothConnected = hasGitHub && hasExtension
    const noneConnected = !hasGitHub && !hasExtension

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
                    <FiZap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Welcome to CodeDash, {firstName}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                    {noneConnected
                        ? 'Connect your tools to start tracking your coding journey. It takes less than a minute.'
                        : 'You\'re almost set. Connect one more integration to unlock your full dashboard.'
                    }
                </p>
            </motion.div>

            <div className="flex flex-col gap-3 mb-8">
                <Step
                    icon={<FiGithub className="w-4 h-4" />}
                    title="Connect GitHub"
                    description="Sync your repos, commits, pull requests and releases. Your shipping heatmap and language data come from here."
                    action="/api/auth/github"
                    actionLabel="Connect GitHub"
                    done={hasGitHub}
                    delay={0.1}
                />
                <Step
                    icon={<FiCode className="w-4 h-4" />}
                    title="Install the VSCode Extension"
                    description="Track coding time, keystrokes, and your unique code style fingerprint — the human vs AI ratio that makes CodeDash different."
                    action="https://marketplace.visualstudio.com"
                    actionLabel="Install Extension"
                    done={hasExtension}
                    delay={0.2}
                />
            </div>

            {noneConnected && (
                <>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3"
                    >
                        What you'll unlock
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Feature
                            icon={<FiTrendingUp className="w-4 h-4" />}
                            title="Coding activity chart"
                            description="See exactly how many hours you code each day, week, or month with period comparisons."
                            delay={0.4}
                        />
                        <Feature
                            icon={<FiZap className="w-4 h-4" />}
                            title="Code style fingerprint"
                            description="Your human vs AI ratio — the only tool that shows how much of your code is truly yours."
                            delay={0.45}
                        />
                        <Feature
                            icon={<FiGithub className="w-4 h-4" />}
                            title="Shipping heatmap"
                            description="Two years of commits, PRs and releases visualized in one view. See your momentum at a glance."
                            delay={0.5}
                        />
                        <Feature
                            icon={<FiUsers className="w-4 h-4" />}
                            title="Leaderboards — coming soon"
                            description="Compare your coding activity with other developers. Public profiles and developer community."
                            delay={0.55}
                        />
                    </div>
                </>
            )}
        </div>
    )
}