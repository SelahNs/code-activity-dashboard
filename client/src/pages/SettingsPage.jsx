// src/pages/SettingsPage.jsx

import { motion } from "framer-motion";
import { useState } from "react";
import AppearanceSettings from "../components/AppearanceSettings";
import ProfileSettings from "../components/ProfileSettings";
import ProfileDisplay from "../components/ProfileDisplay";
import { profileSchema } from "../lib/validation"; // Make sure this path is correct

export default function SettingsPage() {
    // All state is correctly defined
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        bio: '',
        avatarId: '',
        avatarUrl: '',
        isHireable: false,
        email: 'user@example.com', // Placeholder until auth
        socialLinks: { github: '', linkedin: '', twitter: '' }
    });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [saveStatus, setSaveStatus] = useState('idle');
    const [profileMode, setProfileMode] = useState('display');
    const [activeTab, setActiveTab] = useState('profile');

    // --- Core Validation ---
    const validate = (data) => {
        const result = profileSchema.safeParse(data);
        return result.success ? {} : result.error.format();
    };

    // --- Event Handlers (Now Correctly Handling Validation and State) ---
    const updateAndValidate = (newData) => {
        setFormData(newData);
        setFormErrors(validate(newData));
    };

    const handleChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        updateAndValidate({ ...formData, [name]: newValue });
    };

    const handleSocialChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value } = e.target;
        const updatedData = {
            ...formData,
            socialLinks: { ...formData.socialLinks, [name]: value }
        };
        updateAndValidate(updatedData);
    };


    function handleBlur(e) {
        const { name } = e.target;

        // Check if the input name is a social link
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
    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched to show all errors
        const allTouched = {
            fullName: true,
            username: true,
            bio: true,
            socialLinks: { github: true, linkedin: true, twitter: true }
        };
        setTouched(allTouched);

        const errors = validate(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSaveStatus('error'); // Set error status
            return; // Stop the submission
        }

        setFormErrors({});
        setSaveStatus('saving');

        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => {
                setProfileMode('display');
                setSaveStatus('idle');
                setTouched({});
            }, 1500);
        }, 2000);
    };

    const onEditClick = () => setProfileMode('edit');

    const onCancel = () => {
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
                            ? <ProfileDisplay formData={formData} onEditClick={onEditClick} />
                            : <ProfileSettings
                                errors={formErrors}
                                touched={touched}
                                formData={formData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                saveStatus={saveStatus}
                                onCancel={onCancel}
                                setFormData={setFormData}
                                handleSocialChange={handleSocialChange}
                                handleBlur={handleBlur}
                            />
                    )}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                    {activeTab === 'account' && <div>Account Settings</div>}
                    {activeTab === 'notifications' && <div>Notification Settings</div>}
                </div>
            </div>
        </main>
    );
}