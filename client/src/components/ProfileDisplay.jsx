import { getAvatarComponent } from '../data/avatar';
import { Link } from 'react-router-dom';
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { 
    FiCalendar, FiMail, FiExternalLink, FiMapPin, 
    FiBriefcase, FiLink, FiCpu, FiAward, FiZap, FiCode 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ProfileDisplay({ formData, onEditClick }) {
    // Elegant Skeleton Loading State
    if (!formData || !formData.profile) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-48"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-64"></div>
                    </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/40 p-8 h-96"></div>
            </div>
        );
    }

    const { profile, email, username, createdAt, stats } = formData;
    
    // Format member date
    const joinedDate = createdAt 
        ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(createdAt))
        : 'N/A';

    // Fetch Custom Preset Component (falls back to UserIcon natively)
    const PresetAvatar = getAvatarComponent(profile.avatarPresetId);

    // Filter available social urls
    const socialLinks = [
        { name: 'GitHub', url: profile.socials?.github, Icon: AiFillGithub },
        { name: 'LinkedIn', url: profile.socials?.linkedin, Icon: AiFillLinkedin },
        { name: 'Twitter', url: profile.socials?.twitter, Icon: AiFillTwitterCircle },
    ].filter(link => link.url);

    // Format seconds coded into a clean string (e.g., "12h 45m")
    const formatCodingTime = (seconds) => {
        if (!seconds) return '0h';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    // Calculate XP progress bar percentage (assumes standard 1000 XP per level block)
    const xpProgress = stats ? Math.min(100, Math.round((stats.xp % 1000) / 10)) : 0;

    return (
        <motion.section 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Your Profile</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">This is your public developer profile, as others see it on CodeDash.</p>
                </div>
                <button 
                    onClick={onEditClick} 
                    className="sm:self-center inline-flex items-center justify-center rounded-lg py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                    Edit Profile
                </button>
            </div>

            {/* --- MAIN PROFILE CARD --- */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        
                        {/* LEFT COLUMN: IDENTITY & BADGE */}
                        <div className="md:col-span-1 flex flex-col items-center text-center">
                            <div className="relative">
                                {/* Profile Picture / Icon Wrapper */}
                                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : PresetAvatar ? (
                                        <PresetAvatar className="w-20 h-20 text-slate-500 dark:text-slate-400" />
                                    ) : (
                                        <span className="text-slate-400">No Icon</span>
                                    )}
                                </div>
                                
                                {/* Pulse Hireable Indicator */}
                                {profile.isHireable && (
                                    <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 shadow">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    </span>
                                )}
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-100">{profile.fullName || 'No Name Set'}</h3>
                                <Link to={`/u/${username}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    @{username}
                                </Link>
                            </div>

                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <FiMail className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{email}</span>
                            </div>

                            {/* Hireable Chip Badge */}
                            {profile.isHireable && (
                                <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    Open to Opportunities
                                </span>
                            )}
                        </div>

                        {/* RIGHT COLUMN: BIO & METADATA DETAILS */}
                        <div className="md:col-span-2 space-y-6 md:border-l border-slate-100 dark:border-slate-700/60 md:pl-12 pt-6 md:pt-0">
                            {/* Bio */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">About Me</h4>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                    {profile.bio || <span className="text-slate-400 dark:text-slate-500 italic">This developer hasn't added a bio yet.</span>}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <FiCalendar className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                                        <span>Joined {joinedDate}</span>
                                    </div>
                                    {profile.location && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <FiMapPin className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                                            <span>{profile.location}</span>
                                        </div>
                                    )}
                                    {profile.company && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <FiBriefcase className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                                            <span>{profile.company}</span>
                                        </div>
                                    )}
                                    {profile.website && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <FiLink className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
                                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline truncate">
                                                {profile.website.replace(/https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* On the Web Social Profiles */}
                            {socialLinks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Social Connections</h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {socialLinks.map(({ name, url, Icon }) => (
                                            <a 
                                                href={url} 
                                                key={name} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 transition-all group"
                                            >
                                                <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                <span>{name}</span>
                                                <FiExternalLink className="w-3 h-3 text-slate-400 opacity-40" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- DEVELOPER STATS DASHBOARD --- */}
                    {stats && (
                        <div className="border-t border-slate-150 dark:border-slate-700/60 pt-8 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Developer Metrics</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                
                                {/* LEVEL & XP PROGRESS CARD */}
                                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Developer Level</span>
                                        <FiAward className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Lvl {stats.level}</p>
                                        <div className="mt-2.5 space-y-1">
                                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                                                <span>XP Progress</span>
                                                <span>{stats.xp % 1000} / 1000 XP</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TOTAL TIME CODED */}
                                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/10 flex flex-col justify-between min-h-[110px]">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="text-xs font-semibold uppercase tracking-wide">Total Coded Time</span>
                                        <FiCode className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                                            {formatCodingTime(stats.totalSecondsCoded)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Automated stats tracking</p>
                                    </div>
                                </div>

                                {/* ACTIVE STREAK */}
                                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/10 flex flex-col justify-between min-h-[110px]">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="text-xs font-semibold uppercase tracking-wide">Current Streak</span>
                                        <FiZap className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                                            {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Consecutive active dashboard logins</p>
                                    </div>
                                </div>

                                {/* LONGEST STREAK */}
                                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-slate-50 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/10 flex flex-col justify-between min-h-[110px]">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="text-xs font-semibold uppercase tracking-wide">Longest Streak</span>
                                        <FiCpu className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                                            {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">All-time login persistence record</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </motion.section>
    );
}