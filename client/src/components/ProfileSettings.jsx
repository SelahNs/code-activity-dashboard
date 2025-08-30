// src/components/ProfileSettings.jsx

import { avatarOptions } from "../data/avatar";
import { AiFillGithub, AiFillLinkedin, AiFillTwitterCircle } from 'react-icons/ai';
import { FiPlus } from 'react-icons/fi'
import { useRef } from "react";
import UserIcon from "../icons/UserIcon";
import { getAvatarComponent } from "../data/avatar";


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
    handleSocialChange
}) {

    const fileInputRef = useRef(null)
    const BIO_MAX_LENGTH = 300;
    const SelectedAvatar = getAvatarComponent(formData.avatarId);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { // Use onloadend for more robustness
                setFormData(prevState => ({
                    ...prevState,
                    avatarUrl: reader.result,
                    avatarId: ''
                }));
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <section>
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">This is how others will see you on the site.</p>
            </div>

            {/* Card */}
            <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
                <form onSubmit={handleSubmit} noValidate>
                    {/* Form Body */}
                    <div className="p-6 grid grid-cols-1 gap-y-6">

                        <div className="grid lg:col-span-2 grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        id="fullName"
                                        className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Your Name" // ADDED PLACEHOLDER
                                    />
                                </div>
                                {errors?.fullName?._errors[0] && touched?.fullName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.fullName._errors[0]}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Username
                                </label>
                                <div className="mt-1">
                                    <input
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        id="username"
                                        className="block text-slate-900 dark:text-slate-100 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="your-username" // ADDED PLACEHOLDER
                                    />
                                </div>
                                {errors?.username?._errors[0] && touched?.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username._errors[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Bio
                            </label>
                            <div className="mt-1">
                                <textarea
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    maxLength={BIO_MAX_LENGTH}
                                    value={formData.bio}
                                    className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="A short bio about yourself..." // ADDED PLACEHOLDER
                                />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                {errors?.bio?._errors[0] && touched?.bio && (
                                    <p className="text-sm text-red-600">{errors.bio._errors[0]}</p>
                                )}
                                <p className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                                    {formData.bio.length} / {BIO_MAX_LENGTH}
                                </p>
                            </div>
                        </div>


                        <div className="lg:col-span-2"> {/* This is the main grid wrapper */}
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Photo
                            </label>
                            <div className="mt-2 flex items-center gap-6">

                                {/* The Smart Preview */}
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                    {
                                        formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : SelectedAvatar ? (
                                            <SelectedAvatar className="w-12 h-12 text-slate-500" />
                                        ) : (
                                            <UserIcon className="w-12 h-12 text-slate-400" />
                                        )
                                    }
                                </div>

                                {/* The Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="rounded-md py-2 px-3 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    >
                                        Upload
                                    </button>
                                    <input
                                        onChange={handleFileChange}
                                        type="file"
                                        ref={fileInputRef}
                                        className="sr-only"
                                        accept="image/png, image/jpeg" // Good practice to specify accepted file types
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setFormData(prevState => ({ ...prevState, avatarId: '', avatarUrl: '' }))}
                                        className="rounded-md py-2 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* The Avatar Picker List (now separate) */}
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Or choose from our library:</p>
                                <div className="flex flex-wrap mt-2 gap-2">
                                    {avatarOptions.map(({ id, Component }) => (
                                        <button
                                            onClick={() => setFormData(prevState => ({ ...prevState, avatarId: id, avatarUrl: '' }))}
                                            type='button'
                                            key={id}
                                            aria-label={`Choose avatar ${id}`}
                                            className={`rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${formData.avatarId === id ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                        >
                                            <Component
                                                className={`w-8 h-8 ${formData.avatarId === id ? 'text-blue-600' : 'text-slate-500'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            {/* Label and Description */}
                            <div className="sm:col-span-2">
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Available for work</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Let others know you are open to new opportunities.</p>
                            </div>

                            {/* Main container for the interactive part */}
                            <div className="sm:justify-self-end flex items-center">
                                {/* The ON/OFF text */}
                                <span className={`mr-3 text-sm font-medium transition-colors ${formData.isHireable ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {formData.isHireable ? 'ON' : 'OFF'}
                                </span>

                                {/* 
          THIS IS THE KEY:
          A dedicated, relative container for the visual switch.
          The label now wraps this, ensuring clicks work.
        */}
                                <label htmlFor="isHireable" className="relative w-11 h-6 cursor-pointer">
                                    {/* The hidden checkbox is inside, as a peer */}
                                    <input
                                        id="isHireable"
                                        type="checkbox"
                                        className="sr-only peer"
                                        name='isHireable'
                                        checked={formData.isHireable}
                                        onChange={handleChange}
                                    />

                                    {/* The track is a sibling of the peer */}
                                    <div className="w-full h-full bg-gray-200 rounded-full dark:bg-gray-700 transition-colors peer-checked:bg-blue-600"></div>

                                    {/* 
              The knob is a sibling of the peer.
              It is positioned absolutely relative to the <label>, which is now a perfect w-11 h-6 box.
            */}
                                    <div className="absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full"></div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Social Links
                            </label>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                                {/* Simplified and Corrected Social Link Structure */}
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillGithub className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input name='github' type="text" value={formData.socialLinks.github} onChange={handleSocialChange} onBlur={handleBlur}
                                            placeholder="https://github.com/..."
                                            className="block w-full pl-10 text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors?.socialLinks?.github?._errors[0] && touched?.socialLinks?.github && (
                                        <p className="mt-1 text-sm text-red-600">{errors.socialLinks.github._errors[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillLinkedin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input name='linkedin' type="text" value={formData.socialLinks.linkedin} onChange={handleSocialChange} onBlur={handleBlur}
                                            placeholder="https://linkedin.com/in/..."
                                            className="block w-full pl-10 text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors?.socialLinks?.linkedin?._errors[0] && touched?.socialLinks?.linkedin && (
                                        <p className="mt-1 text-sm text-red-600">{errors.socialLinks.linkedin._errors[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <AiFillTwitterCircle className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input name='twitter' type="text" value={formData.socialLinks.twitter} onChange={handleSocialChange} onBlur={handleBlur}
                                            placeholder="https://twitter.com/..."
                                            className="block w-full pl-10 text-slate-900 dark:text-slate-100 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    {errors?.socialLinks?.twitter?._errors[0] && touched?.socialLinks?.twitter && (
                                        <p className="mt-1 text-sm text-red-600">{errors.socialLinks.twitter._errors[0]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with Error Message */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
                        {saveStatus === 'error' && <p className="text-sm text-red-600 mr-auto">Please correct the errors and try again.</p>}
                        <button
                            type="button"
                            className="rounded-md py-2 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`inline-flex items-center justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                ${saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} 
                transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={saveStatus === 'saving' || saveStatus === 'success'}
                        >
                            {saveStatus === 'error' ? 'Save Changes' :
                                saveStatus === 'saving' ? 'Saving...' :
                                    saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}