// src/components/ProfileDisplay.jsx

import { getAvatarComponent } from '../data/avatar';
import { Link } from 'react-router-dom';
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { FiCalendar, FiMail, FiExternalLink } from 'react-icons/fi';
import UserIcon from '../icons/UserIcon';
import FeatherIcon from '../icons/FeatherIcon';
import { motion } from 'framer-motion';

export default function ProfileDisplay({ formData, onEditClick }) {

    // --- Guard Clause for Loading State ---
    if (!formData || !formData.user) {
        return (
            <motion.section className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-64"></div>
                <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-800/50 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                            <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-md w-1/2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                        </div>
                    </div>
                </div>
            </motion.section>
        );
    }

    // --- Data Formatting & Component Logic ---
    const joinedDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(formData.user.date_joined));
    const LibraryAvatar = getAvatarComponent(formData.avatar_id);
    
    const socialLinks = [
        { name: 'GitHub', url: formData.github_url, Icon: AiFillGithub },
        { name: 'LinkedIn', url: formData.linkedin_url, Icon: AiFillLinkedin },
        { name: 'Twitter', url: formData.twitter_url, Icon: AiFillTwitterCircle },
    ].filter(link => link.url);

    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Profile</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">This is your public profile, as others will see it.</p>
            </div>

            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                        
                        {/* --- NEW, CLEANER LEFT COLUMN: IDENTITY BLOCK --- */}
                        <div className="md:col-span-1 flex flex-col items-center text-center pt-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-lg">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : LibraryAvatar ? (
                                        <LibraryAvatar className="w-20 h-20 text-gray-500" />
                                    ) : (
                                        <UserIcon className="w-20 h-20 text-gray-400" />
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 block w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" title="Status: Online"></div>
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formData.user.full_name}</h3>
                                <Link to={`/u/${formData.user.username}`} className="text-md text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                                    @{formData.user.username}
                                </Link>
                            </div>

                             <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <FiMail className="w-4 h-4" />
                                <span>{formData.user.email}</span>
                            </div>
                        </div>

                        {/* --- NEW, CLEANER RIGHT COLUMN: DETAILS --- */}
                        <div className="md:col-span-2 space-y-8 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-8 md:pt-0 md:pl-12">
                            {/* --- Bio Section --- */}
                            <div>
                                <h4 className="inline-flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                                    <FeatherIcon className="w-5 h-5"/>
                                    Bio
                                </h4>
                                <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                    {formData.bio || <span className="text-gray-400 italic">This user has not yet written a bio.</span>}
                                </p>
                            </div>

                             {/* --- Details Section (moved from left column) --- */}
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Details</h4>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <FiCalendar className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-500 dark:text-gray-400">Member since {joinedDate}</span>
                                    </div>
                                    {formData.is_hireable && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-5 flex justify-center">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            </div>
                                            <span className="text-gray-500 dark:text-gray-400">Open to new opportunities</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* --- Social Links Section --- */}
                            {socialLinks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">On the web</h4>
                                    <div className="mt-2 space-y-2">
                                        {socialLinks.map(({ name, url, Icon }) => (
                                            <a href={url} key={name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group text-sm">
                                                <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors break-all">{url}</span>
                                                <FiExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CARD FOOTER: EDIT BUTTON --- */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onEditClick} className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 ...">
                        Edit Profile
                    </button>
                </div>
            </div>
        </motion.section>
    );
}