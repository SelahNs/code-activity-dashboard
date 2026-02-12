// src/components/ProfileSettings.jsx

import { useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarComponent, avatarOptions } from "../data/avatar";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import UserIcon from "../icons/UserIcon";
import CameraIcon from "../icons/CameraIcon";
// Re-using your excellent FormError component for consistency
import { FormError } from '../pages/SignupPage';

export default function ProfileSettings({
    touched,
    handleBlur,
    errors,
    formData,// this stands for the draftproflie varaible in the settgins page
    handleChange,
    handleSubmit, // Rename the handleSubmit from props
    saveStatus,
    onCancel,
    setFormData,
    handleUserChange,
    handleSocialChange,
    setAvatarFile
}) {
    const fileInputRef = useRef(null);
    const BIO_MAX_LENGTH = 300;
    // const SelectedAvatar = getAvatarComponent(formData.avatarId);
    console.log("Rendering ProfileSettings with formData:", formData);
    const LibraryAvatar = formData.avatar_id ? getAvatarComponent(formData.avatar_id) : null;

    // State to hold the actual file object for upload


    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file); // Store the actual file for submission
            const previewUrl = URL.createObjectURL(file); // Create a temporary URL for preview
            setFormData(prevState => ({ ...prevState, previewUrl: previewUrl, avatar_id: '', avatar: null }));
        }
    }



    // In ProfileSettings.jsx, replace the entire `return` statement with this:


    // In ProfileSettings.jsx, replace the entire `return` statement with this:

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* --- STANDARD PAGE HEADER --- */}
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Public Profile</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">This information will be displayed publicly on your profile.</p>
            </div>

            {/* --- UNIFIED FORM CARD --- */}
            <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">

                {/* --- MAIN CONTENT AREA (WITH PADDING) --- */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">

                        {/* --- LEFT COLUMN: PHOTO --- */}
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your Photo</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click the image below to upload a new photo.</p>

                            <div className="mt-6 flex flex-col items-center text-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                                    title="Upload new photo"
                                >
                                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-lg group-hover:ring-indigo-500 transition-all duration-300">
                                        {formData?.previewUrl ? (
                                            <img src={formData.previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : formData?.avatar ? (
                                            <img src={formData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                        ) : LibraryAvatar ? (
                                            <LibraryAvatar className="w-20 h-20 text-gray-500" />
                                        ) : (
                                            <UserIcon className="w-20 h-20 text-gray-400" />
                                        )}
                                    </div>
                                    {/* --- HOVER OVERLAY --- */}
                                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" /* ... camera icon svg ... */>
                                            <CameraIcon />
                                        </svg>
                                    </div>
                                </button>
                                {/* --- HIDDEN FILE INPUT --- */}
                                <input onChange={handleFileChange} type="file" ref={fileInputRef} className="sr-only" accept="image/png, image/jpeg, image/webp" />
                            </div>
                            <div className="mt-6">
                                <p className="text-xs text-center text-gray-500 dark:text-gray-400">Or choose an avatar</p>
                                <div className="flex flex-wrap justify-center mt-3 gap-3">
                                    {avatarOptions.map(({ id, Component }) => (
                                        <button type="button" key={id} onClick={() => { setFormData(prevState => ({ ...prevState, avatar_id: id, previewUrl: null, avatar: null })); setAvatarFile(null); fileInputRef.current.value = null; }} className={`rounded-full p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${formData.avatar_id === id ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                            <Component className={`w-6 h-6 ${formData.avatar_id === id ? '' : 'text-gray-500'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: ALL OTHER FIELDS --- */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input id="fullName" name="full_name" type="text" value={formData?.user?.full_name || ''} onChange={handleUserChange} onBlur={handleBlur} placeholder="e.g., Jane Doe"
                                    className="mt-1 block w-full text-gray-900 dark:text-gray-100 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500" />
                                <AnimatePresence>
                                    {errors?.full_name?._errors[0] && touched?.full_name && <FormError message={errors.full_name._errors[0]} />}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                                <textarea id="bio" name="bio" rows={4} maxLength={BIO_MAX_LENGTH} value={formData.bio || ''} onChange={handleChange} onBlur={handleBlur} placeholder="A short bio about yourself..."
                                    className="mt-1 block w-full text-gray-900 dark:text-gray-100 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500" />
                                <div className="flex justify-between items-center mt-1">
                                    <AnimatePresence>
                                        {errors?.bio?._errors[0] && touched?.bio && <FormError message={errors.bio._errors[0]} />}
                                    </AnimatePresence>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formData?.bio?.length || 0} / {BIO_MAX_LENGTH}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Social Links</h3>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    {['github', 'linkedin', 'twitter'].map((social) => {
                                        const Icon = { github: AiFillGithub, linkedin: AiFillLinkedin, twitter: AiFillTwitterCircle }[social];
                                        const fieldName = `${social}_url`;
                                        return (
                                            <div key={social} className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Icon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input name={fieldName} type="text" value={formData?.[fieldName] || ''} onChange={handleChange} onBlur={handleBlur} placeholder={`https://${social}.com/...`}
                                                    className="block w-full pl-10 text-gray-900 dark:text-gray-100 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CARD FOOTER: ACTIONS & WORK STATUS --- */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Available for work</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Let recruiters know you're open to opportunities.</p>
                        </div>
                        <label htmlFor="is_hireable" className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="is_hireable" name="is_hireable" className="sr-only peer" checked={formData.is_hireable || false} onChange={handleChange} />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <AnimatePresence>
                            {saveStatus === 'error' && <p className="text-sm text-red-600 mr-auto">Please correct the errors above.</p>}
                        </AnimatePresence>
                        <button type="button" onClick={onCancel} className="rounded-lg py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={saveStatus === 'saving' || saveStatus === 'success'} className="w-36 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                            {saveStatus === 'saving' ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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