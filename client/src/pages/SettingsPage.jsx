// // const [formData, setFormData] = useState({
//         fullName: '',
//         username: '',
//         bio: '',
//         avatarId: '',
//         avatarUrl: '',
//         isHireable: false,
//         email: 'user@example.com', // Placeholder until auth
//         socialLinks: { github: '', linkedin: '', twitter: '' }
//     });
// src/pages/SettingsPage.jsx

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AppearanceSettings from "../components/AppearanceSettings";
import ProfileSettings from "../components/ProfileSettings";
import ProfileDisplay from "../components/ProfileDisplay";
import { profileSchema } from "../lib/validation"; // Make sure this path is correct
import useAuthStore from "../stores/useAuthStore";
import useNotificationStore from "../stores/useNotificationStore";
import AccountSettings from "../components/AccountsSettings";

export default function SettingsPage({ }) {
    // All state is correctly defined

    const userProfile = useAuthStore((state) => state.user);
    const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
    const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
    const showNotification = useNotificationStore((state) => state.showNotification);
    const [draftProfile, setDraftProfile] = useState(userProfile)
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [saveStatus, setSaveStatus] = useState('idle');
    const [profileMode, setProfileMode] = useState('display');
    const [activeTab, setActiveTab] = useState('profile');
    //const [formData, setFormData] = useState({ ...user })
    const updateGlobalProfile = useAuthStore((state) => state.updateGlobalProfile);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);


    useEffect(() => {
        setDraftProfile(userProfile);
    }, [userProfile]);

    // --- Core Validation ---
    const validate = (data) => {
        const result = profileSchema.safeParse(data);
        return result.success ? {} : result.error.format();
    };

    // --- Event Handlers (Now Correctly Handling Validation and State) ---
    const updateAndValidate = (newData) => {
        setDraftProfile(newData);
        setFormErrors(validate(newData));
    };

    const handleChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        updateAndValidate({ ...draftProfile, [name]: newValue });
        console.log('showing the draft profil on change', draftProfile)
    };

    const handleUserChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value } = e.target;

        // Create an updated user object
        const updatedUser = { ...draftProfile.user, [name]: value };

        // Update the draftProfile with the new nested user object
        updateAndValidate({ ...draftProfile, user: updatedUser });
    };

    // this one we may not need ti becasue now we have changed our structuer fomr just social links object to there own keys  

    const handleSocialChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value } = e.target;
        const updatedData = {
            ...draftProfile,
            socialLinks: { ...draftProfile.socialLinks, [name]: value }
        };
        updateAndValidate(updatedData);
    };


    const handleBlur = (e) => {
        const { name } = e.target;

        // Check if the input name is a social link, this also assums we have  nested object so it might need some corrections
        if (name === 'github' || name === 'linkedin' || name === 'twitter') {
            // Update the nested touched state for socialLinks
            setTouched(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [name]: true
                }
            }));
        } else {
            // Handle top-level fields as before
            setTouched(prev => ({
                ...prev,
                [name]: true
            }));
        }
    }


    // THIS IS THE CRITICAL FIX FOR YOUR "SUBMIT" FEEDBACK
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the form from reloading the page
        console.log(draftProfile)
        setSaveStatus('saving');

        // Prepare the text data for the API.
        const submissionData = {
            // NOTE: The name comes from the nested user object in your draft state
            full_name: draftProfile.user.full_name,
            bio: draftProfile.bio,
            is_hireable: draftProfile.is_hireable,
            github_url: draftProfile.github_url,
            linkedin_url: draftProfile.linkedin_url,
            twitter_url: draftProfile.twitter_url,
            avatar_id: draftProfile.avatar_id || ''
        };

        console.log('submiossion data', submissionData)

        // Call the updateUserProfile action from your store,
        // giving it BOTH the text data AND the file.
        const result = await updateUserProfile(submissionData, avatarFile);

        if (result.success) {
            setDraftProfile(result.data)
            setSaveStatus('success');
            showNotification("Profile updated successfully!", "success");
            setAvatarFile(null); // Clear the file after successful upload we need more clariication in this, and also the handle dubmit package transmision including the awiat fetch
            setTimeout(() => {
                setProfileMode('display');
                setSaveStatus('idle');
            }, 1500);
        } else {
            setSaveStatus('error');
            showNotification(result.error?.detail || 'Failed to update profile.', 'error');
        }
    };

    const onEditClick = () => {
        setProfileMode('edit');
        setDraftProfile(userProfile);
    };

    const onCancel = () => {
        setDraftProfile(userProfile);
        setProfileMode('display');
        setFormErrors({});
        setTouched({});
    };



    // The NEW, smarter getTabClassName function
    const getTabClassName = (tab) => {
        const isActive = activeTab === tab;
        // Base classes for all tabs/links
        const baseClasses = 'relative z-10 w-full text-center lg:text-left py-2 px-3 transition-colors duration-200 rounded-md';

        // Classes specific to the active state (text color)
        const activeClasses = 'font-bold text-slate-800 dark:text-slate-100';

        // Classes for the inactive state (text color and hover)
        const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    if (!userProfile) {
        return <div className="p-8">Loading settings...</div>;
    }


    return (
        <main className="px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-200">Settings</h1>

            {/* THIS IS THE CORRECTED LAYOUT STRUCTURE */}
            <div className="flex flex-col lg:flex-row gap-10 mt-8">

                <div className="w-full lg:w-64 lg:sticky top-8 self-start">
                    {/* This UL is now a GRID on mobile, and a FLEX container on desktop */}
                    <ul className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 lg:grid-cols-1 lg:bg-transparent lg:p-0">

                        {/* We map over our tabs */}
                        {['profile', 'appearance', 'account', 'notifications'].map(tab => (
                            <li key={tab} className="relative flex"> {/* The li remains the relative container */}
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={getTabClassName(tab)}
                                >
                                    {/* Capitalize the first letter for display */}
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>

                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="active-settings-tab"
                                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow-md rounded-md z-0"
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-grow max-w-3xl">
                    {activeTab === 'profile' && (
                        profileMode === 'display'
                            ? <ProfileDisplay formData={userProfile} onEditClick={onEditClick} />
                            : <ProfileSettings
                                errors={formErrors}
                                touched={touched}
                                formData={draftProfile}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                saveStatus={saveStatus}
                                setAvatarFile={setAvatarFile}
                                onCancel={onCancel}
                                setFormData={setDraftProfile}
                                handleSocialChange={handleSocialChange}
                                handleUserChange={handleUserChange}
                                handleBlur={handleBlur}
                            />
                    )}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                    {activeTab === 'account' && <AccountSettings />}
                    {activeTab === 'notifications' && <div>Notification Settings</div>}
                </div>
            </div>
        </main>
    );
}