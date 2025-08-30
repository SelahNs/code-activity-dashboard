import { getAvatarComponent } from "../data/avatar";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { FiMail, FiCalendar } from "react-icons/fi";
import UserIcon from "../icons/UserIcon";
import { Link } from 'react-router-dom';

export default function ProfileDisplay({ formData, onEditClick }) {
    const SelectedAvatar = getAvatarComponent(formData.avatarId);
    return (
        <section>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">This is how others will see you on the site.</p>
            </div>
            <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
                <div className="p-6 flex flex-col items-center gap-2 text-center">
                    <div className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        {
                            formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                            ) : SelectedAvatar ? (
                                <SelectedAvatar className="w-12 h-12 text-slate-500" />
                            ) : (
                                <UserIcon className="w-12 h-12 text-slate-400" />
                            )
                        }
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{formData.fullName}</h3>
                    <Link to={`\/u/${formData.username}`} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><p>@{formData.username}</p></Link>
                    <div className="flex items-center gap-2">
                        <FiMail className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email placeholder{/*formData.email*/}</p>
                    </div>
                    {formData.isHireable && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Open to Work</span>}

                    <div className="flex items-center gap-2 mt-2">
                        <FiCalendar className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Member since August 2025
                        </p>
                    </div>


                </div>
                <div className="px-6 py-4 text-center border-t border-slate-200 dark:border-slate-700">

                    <p className="text-sm max-w-md mx-auto text-slate-600 dark:text-slate-300">{formData.bio}</p>
                    <div className="mt-4 flex justify-center gap-4">
                        {formData.socialLinks.github && <a title="GitHub Profile" target="blank" rel="noopener noreferrer" href={formData.socialLinks.github}><AiFillGithub className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" /></a>}
                        {formData.socialLinks.linkedin && <a title="LinkedIn Profile" target="blank" rel="noopener noreferrer" href={formData.socialLinks.linkedin}><AiFillLinkedin className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" /></a>}
                        {formData.socialLinks.twitter && <a title="Twitter Profile" target="blank" rel="noopener noreferrer" href={formData.socialLinks.twitter}><AiFillTwitterCircle className="text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" /></a>}
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 text-right rounded-b-lg ">
                    <button
                        onClick={onEditClick}
                        className="rounded-md py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        Edit Profile
                    </button>

                </div>
            </div>
        </section>
    )
}