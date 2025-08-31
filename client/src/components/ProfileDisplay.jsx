// src/components/ProfileDisplay.jsx

import { getAvatarComponent } from '../data/avatar';
import { Link } from 'react-router-dom';
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { FiMail, FiCalendar } from 'react-icons/fi';

export default function ProfileDisplay({ formData, onEditClick }) {

    // --- Guard Clause for Loading State ---
    // This is essential to prevent crashes before data is loaded.
    if (!formData) {
        return (
            <section>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800 p-6 text-center">
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </section>
        );
    }

    // --- Data Formatting ---
    // This is now safe because of the guard clause above.
    const joinedDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(formData.dateJoined));

    // --- Avatar Logic ---
    // We get the component directly here. This is the single source of truth for the icon.
    const AvatarComponent = getAvatarComponent(formData.avatarId);

    return (
        <section>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">This is how others will see you on the site.</p>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
                {/* Card Header */}
                <div className="p-6 flex flex-col items-center gap-2 text-center">
                    <div className="relative w-24 h-24">
                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                            {/* THIS IS THE FINAL, CORRECT LOGIC */}
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <AvatarComponent className="w-16 h-16 text-slate-500" />
                            )}
                        </div>
                        <span className="absolute bottom-1 right-1 block w-4 h-4 bg-gray-400 rounded-full border-2 border-white dark:border-slate-800" title="Status: Offline"></span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-2">{formData.fullName || formData.username}</h3>

                    <Link to={`/u/${formData.username}`} className="text-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        @{formData.username}
                    </Link>

                    <div className="flex items-center gap-2 mt-1">
                        <FiMail className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email}</p>
                    </div>

                    {formData.isHireable && (
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Open to Work
                        </span>
                    )}
                </div>

                {/* Card Body */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-center text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                        {formData.bio || "No bio provided. Click 'Edit Profile' to add one!"}
                    </p>

                    <div className="mt-6 flex justify-center gap-6">
                        {formData.socialLinks?.github && <a href={formData.socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub"><AiFillGithub className="text-2xl text-slate-400 hover:text-slate-600" /></a>}
                        {formData.socialLinks?.linkedin && <a href={formData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><AiFillLinkedin className="text-2xl text-slate-400 hover:text-slate-600" /></a>}
                        {formData.socialLinks?.twitter && <a href={formData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><AiFillTwitterCircle className="text-2xl text-slate-400 hover:text-slate-600" /></a>}
                    </div>
                </div>

                {/* Card Footer */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-between items-center gap-4 rounded-b-lg">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FiCalendar className="w-4 h-4" />
                        <span>Member since {joinedDate}</span>
                    </div>
                    <button onClick={onEditClick} className="rounded-md py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600">
                        Edit Profile
                    </button>
                </div>
            </div>
        </section>
    );
}