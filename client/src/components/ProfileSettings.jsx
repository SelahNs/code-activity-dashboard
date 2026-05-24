import { useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarComponent, avatarOptions } from "../data/avatar";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { FiCamera, FiAlertCircle } from "react-icons/fi";

const LocalFormError = ({ message }) => (
    <motion.div 
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium"
    >
        <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{message}</span>
    </motion.div>
);

export default function ProfileSettings({
    touched,
    handleBlur,
    errors,
    formData,
    handleChange,
    handleSubmit,
    saveStatus,
    onCancel,
    setFormData,
    handleSocialChange,
    setAvatarFile
}) {
    const fileInputRef = useRef(null);
    const BIO_MAX_LENGTH = 300;

    const currentPresetId = formData?.profile?.avatarPresetId || 'user';
    const PresetAvatar = getAvatarComponent(currentPresetId);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setFormData(prevState => ({ 
                ...prevState,
                profile: {
                    ...prevState.profile,
                    avatarPresetId: '',
                    avatarUrl: previewUrl
                }
            }));
        }
    }

    const selectPreset = (id) => {
        setAvatarFile(null);
        fileInputRef.current.value = null;
        setFormData(prevState => ({
            ...prevState,
            profile: {
                ...prevState.profile,
                avatarPresetId: id,
                avatarUrl: null
            }
        }));
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Public Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Update your information to make it visible across CodeDash.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">

                        {/* LEFT COLUMN: AVATAR / PHOTO UPLOADER */}
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Photo</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a custom photo or use an avatar preset.</p>

                            <div className="mt-6 flex flex-col items-center text-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
                                    title="Upload custom image file"
                                >
                                    <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg group-hover:ring-indigo-500 transition-all duration-300">
                                        {formData?.profile?.avatarUrl ? (
                                            <img src={formData.profile.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : PresetAvatar ? (
                                            <PresetAvatar className="w-20 h-20 text-slate-500 dark:text-slate-400" />
                                        ) : (
                                            <span className="text-slate-400">No Image</span>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                                        <FiCamera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" />
                                    </div>
                                </button>
                                <input onChange={handleFileChange} type="file" ref={fileInputRef} className="sr-only" accept="image/png, image/jpeg, image/webp" />
                            </div>

                            <div className="mt-6">
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Or choose a preset</p>
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {avatarOptions.map(({ id, Component }) => (
                                        <button 
                                            type="button" 
                                            key={id} 
                                            onClick={() => selectPreset(id)}
                                            className={`rounded-xl p-2.5 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                currentPresetId === id 
                                                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Component className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: CORE FIELDS */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input 
                                    id="fullName" 
                                    name="fullName" 
                                    type="text" 
                                    value={formData?.profile?.fullName || ''} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    placeholder="e.g., Jane Doe"
                                    className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" 
                                />
                                <AnimatePresence>
                                    {errors?.fullName?._errors?.[0] && touched?.fullName && (
                                        <LocalFormError message={errors.fullName._errors[0]} />
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                                <textarea 
                                    id="bio" 
                                    name="bio" 
                                    rows={3} 
                                    maxLength={BIO_MAX_LENGTH} 
                                    value={formData?.profile?.bio || ''} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    placeholder="Tell the community about yourself..."
                                    className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors resize-none" 
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <div className="flex-1">
                                        <AnimatePresence>
                                            {errors?.bio?._errors?.[0] && touched?.bio && (
                                                <LocalFormError message={errors.bio._errors[0]} />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                                        {(formData?.profile?.bio || '').length} / {BIO_MAX_LENGTH}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                                    <input 
                                        id="location" 
                                        name="location" 
                                        type="text" 
                                        value={formData?.profile?.location || ''} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur} 
                                        placeholder="City, Country"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" 
                                    />
                                    <AnimatePresence>
                                        {errors?.location?._errors?.[0] && touched?.location && (
                                            <LocalFormError message={errors.location._errors[0]} />
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
                                    <input 
                                        id="company" 
                                        name="company" 
                                        type="text" 
                                        value={formData?.profile?.company || ''} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur} 
                                        placeholder="Where you work"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" 
                                    />
                                    <AnimatePresence>
                                        {errors?.company?._errors?.[0] && touched?.company && (
                                            <LocalFormError message={errors.company._errors[0]} />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                                <input 
                                    id="website" 
                                    name="website" 
                                    type="url" 
                                    value={formData?.profile?.website || ''} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur} 
                                    placeholder="https://yoursite.com"
                                    className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" 
                                />
                                <AnimatePresence>
                                    {errors?.website?._errors?.[0] && touched?.website && (
                                        <LocalFormError message={errors.website._errors[0]} />
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Social Links</h3>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                    {['github', 'linkedin', 'twitter'].map((social) => {
                                        const Icon = { github: AiFillGithub, linkedin: AiFillLinkedin, twitter: AiFillTwitterCircle }[social];
                                        return (
                                            <div key={social} className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <input 
                                                    name={social} 
                                                    type="text" 
                                                    value={formData?.profile?.socials?.[social] || ''} 
                                                    onChange={handleSocialChange} 
                                                    onBlur={handleBlur} 
                                                    placeholder={`https://${social}.com/username`}
                                                    className="block w-full pl-10 pr-3 py-2 text-slate-900 dark:text-slate-100 rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" 
                                                />
                                                <AnimatePresence>
                                                    {errors?.socials?.[social]?._errors?.[0] && touched?.[social] && (
                                                        <LocalFormError message={errors.socials[social]._errors[0]} />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* WORK STATUS & ACTIONS */}
                <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Available for work</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Let recruiters know you're open to opportunities.</p>
                        </div>
                        <label htmlFor="isHireable" className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="isHireable" 
                                name="isHireable" 
                                className="sr-only peer" 
                                checked={formData?.profile?.isHireable || false} 
                                onChange={handleChange} 
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <AnimatePresence>
                            {saveStatus === 'error' && (
                                <p className="text-sm text-rose-600 mr-auto font-medium">Please correct form errors.</p>
                            )}
                        </AnimatePresence>
                        <button type="button" onClick={onCancel} className="rounded-lg py-2 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={saveStatus === 'saving' || saveStatus === 'success'} 
                            className="w-36 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saveStatus === 'saving' ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </motion.section>
    );
}