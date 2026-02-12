// src/pages/PublicProfilePage.jsx
import { useState, useEffect } from 'react';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiStar, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- MOCK DATA (Simulates API calls) ---
// You would replace these with your actual API calls
const MOCK_PROFILE_DATA = {
    name: 'Alex Doe',
    avatarUrl: 'https://i.pravatar.cc/150?u=alexdoe',
    title: 'Full-Stack Developer & UI/UX Enthusiast',
    bio: 'I build intuitive and performant web applications from concept to deployment...',
    socials: {
        github: 'https://github.com/alexdoe',
        linkedin: 'https://linkedin.com/in/alexdoe',
        twitter: 'https://twitter.com/alexdoe',
    },
    email: 'alex.doe@example.com',
    isHirable: true,
    liveStatus: {
        isLive: true,
        message: 'Actively coding on: Showcase Page'
    },
    // --- NEW MOCK DATA ---
    techStack: [
        { name: 'React', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
        { name: 'Node.js', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg' },
        { name: 'Python', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg' },
        { name: 'AWS', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
        { name: 'Docker', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg' },
        { name: 'Figma', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg' }
    ],
    currentlyLearning: ['Rust', 'WebAssembly'],
    blogFeed: [
        { id: 1, title: 'Why Server Components in Next.js are a Game Changer', date: '2025-09-21', url: '#' },
        { id: 2, title: 'A Practical Guide to State Management in React', date: '2025-09-15', url: '#' },
    ],
    achievements: [
        { icon: '🏆', text: 'GitHub Arctic Code Vault Contributor' },
        { icon: '🚀', text: 'Top 10 in Local Hackathon 2024' }
    ]
};

const MOCK_STATS_DATA = {
    hoursCoded: 1842,
    totalProjects: 24,
    primaryLanguage: 'JavaScript',
    // We'll add a placeholder for the heatmap data
    contributionData: Array.from({ length: 365 }, (_, i) => ({
        date: new Date(new Date().setDate(new Date().getDate() - i)).toISOString(),
        count: Math.floor(Math.random() * 15),
    })),
};

const MOCK_PINNED_PROJECTS = [
    { id: 'proj1', title: 'Dashboard UI Kit', description: 'A comprehensive UI kit for building modern dashboards, with a focus on data visualization.', stars: 125, lastUpdated: new Date().toISOString(), github: { primaryLanguage: 'React' } },
    { id: 'proj2', title: 'Real-time Chat API', description: 'A WebSocket-based API service for building real-time communication features.', stars: 88, lastUpdated: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), github: { primaryLanguage: 'Node.js' } },
    { id: 'proj3', title: 'Python Data Scraper', description: 'A script for scraping and analyzing public data sets for market research.', stars: 45, lastUpdated: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(), github: { primaryLanguage: 'Python' } },
];


// --- Reusable Placeholder Components ---
// You can replace these with your actual, more detailed components later.

const ProfileCard = ({ profile }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative text-center">

        {/* --- 1. ABSOLUTELY POSITIONED HIREABLE BADGE --- */}
        {/* This badge now lives in a dedicated space at the top of the card. */}
        {/* It is completely independent of the avatar. */}
        {profile.isHirable && (
            <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-bold px-3 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    AVAILABLE FOR HIRE
                </div>
            </div>
        )}

        {/* --- 2. MAIN CONTENT AREA (with top padding) --- */}
        {/* We add significant padding to the top (pt-12) to create a "safe zone" for the badge above. */}
        {/* All content, including the avatar, now starts much lower down. */}
        <div className="px-8 pb-8 pt-12">

            {/* --- AVATAR CONTAINER --- */}
            {/* It sits cleanly in the normal document flow. No negative margins. */}
            <div className="relative inline-block mb-4">
                <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-white dark:border-slate-800"
                />

                {/* The 'is active' dot is still tied to the avatar, which is correct. */}
                {profile.liveStatus?.isLive && (
                    <div className="absolute bottom-5 right-1 block h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800" title="Actively coding via VS Code extension">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    </div>
                )}
            </div>

            {/* --- REST OF THE CARD CONTENT --- */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.name}</h1>
            <h2 className="text-md font-medium text-blue-600 dark:text-blue-400 mt-1">{profile.title}</h2>

            {profile.liveStatus?.isLive ? (
                <div className="mt-4 p-2 bg-blue-50 dark:bg-slate-700/50 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                    <p>{profile.liveStatus.message}</p>
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 my-4">{profile.bio}</p>
            )}

            <div className="flex justify-center gap-4 my-6">
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiGithub size={20} /></a>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiLinkedin size={20} /></a>
                <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><FiTwitter size={20} /></a>
            </div>
            <a href={`mailto:${profile.email}`} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                <FiMail className="w-4 h-4" />
                <span>Contact Me</span>
            </a>
        </div>
    </div>
);

// This would be your real GitHub Heatmap component
const ActivityHeatmapPlaceholder = () => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-400">
        GitHub Activity Heatmap Goes Here
    </div>
)

// --- MAIN PAGE COMPONENT ---
export default function PublicProfilePage() {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [pinnedProjects, setPinnedProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            await new Promise(res => setTimeout(res, 500));
            setProfile(MOCK_PROFILE_DATA);
            setStats(MOCK_STATS_DATA);
            setPinnedProjects(MOCK_PINNED_PROJECTS);
            setIsLoading(false);
        };
        fetchAllData();
    }, []);

    if (isLoading) { return <div className="text-center p-12">Loading Profile...</div>; }


    const hasLearningItems = profile?.currentlyLearning && profile.currentlyLearning.length > 0;
    const hasAchievements = profile?.achievements && profile.achievements.length > 0;
    const hasBlogPosts = profile?.blogFeed && profile.blogFeed.length > 0;

    // Check if the entire "left column" of our final grid has any content
    const hasLeftColumnContent = hasLearningItems || hasAchievements;

    return (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <aside className="lg:col-span-1"><div className="sticky top-8">{profile && <ProfileCard profile={profile} />}</div></aside>
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">My Activity</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Hours Coded</h4><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.hoursCoded}</p></div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</h4><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalProjects}</p></div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"><h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Primary Language</h4><p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.primaryLanguage}</p></div>
                            </div>
                            <ActivityHeatmapPlaceholder />
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Pinned Projects</h3>
                            <div className="space-y-4">{pinnedProjects.map(project => (
                                // Replace this div with your actual `ProjectCard` component
                                <div key={project.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">{project.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{project.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                                        <span className="flex items-center gap-1"><FiStar className="text-yellow-500" /> {project.stars}</span>
                                        <span className="flex items-center gap-1"><FiClock /> {new Date(project.lastUpdated).toLocaleDateString()}</span>
                                        <span className="font-medium text-blue-500">{project.github.primaryLanguage}</span>
                                    </div>
                                </div>
                            ))}</div>
                            <Link to="/projects" className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">View All My Projects →</Link>
                        </section>

                        {/* --- NEW: Section 3: My Tech Stack --- */}
                        {profile?.techStack && profile.techStack.length > 0 && (
                            <section>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">My Tech Stack</h3>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 text-center">
                                        {profile.techStack.map(tech => (
                                            <div key={tech.name} className="flex flex-col items-center gap-2">
                                                <img src={tech.logo} alt={tech.name} className="h-10 w-10 object-contain" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{tech.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                        {(profile.currentlyLearning?.length > 0 || profile.achievements?.length > 0 || profile.blogFeed?.length > 0) && (

                            // This intelligent grid becomes 2 columns ONLY if there's content on both sides.
                            // Otherwise, it stays a single column, preventing any "holes".
                            <div
                                className={`grid grid-cols-1 ${(profile.currentlyLearning?.length > 0 || profile.achievements?.length > 0) && profile.blogFeed?.length > 0
                                    ? 'md:grid-cols-2'
                                    : ''
                                    } gap-8`}
                            >

                                {/* --- LEFT COLUMN (Learning & Achievements) --- */}
                                {/* This entire column only renders if it has at least one of its children. */}
                                {(profile.currentlyLearning?.length > 0 || profile.achievements?.length > 0) && (
                                    <div className="space-y-8">

                                        {/* Card 1: Currently Learning (Renders only if it has data) */}
                                        {profile.currentlyLearning?.length > 0 && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Currently Learning</h3>
                                                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex flex-wrap gap-2">
                                                        {profile.currentlyLearning.map(item => (
                                                            <span key={item} className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50 rounded-full">{item}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {/* Card 2: Achievements (Renders only if it has data) */}
                                        {profile.achievements?.length > 0 && (
                                            <section>
                                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Achievements</h3>
                                                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <ul className="space-y-4">
                                                        {profile.achievements.map(ach => (
                                                            <li key={ach.text} className="flex items-center gap-3">
                                                                <span className="text-lg">{ach.icon}</span>
                                                                <span className="text-sm text-slate-600 dark:text-slate-300">{ach.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                )}

                                {/* --- RIGHT COLUMN (Latest Articles) --- */}
                                {/* This section only renders if it has data */}
                                {profile.blogFeed?.length > 0 && (
                                    <section>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Latest Articles</h3>
                                        <div className="space-y-4">
                                            {profile.blogFeed.map(post => (
                                                <a href={post.url} key={post.id} className="group block bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors">
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600">{post.title}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{new Date(post.date).toLocaleDateString()}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </motion.main >
    );
}