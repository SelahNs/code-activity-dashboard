import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AppearanceSettings from "../components/AppearanceSettings";
import ProfileSettings from "../components/ProfileSettings";
import ProfileDisplay from "../components/ProfileDisplay";
import { profileSchema } from "../lib/validation";
import useUserStore from "../stores/useUserStore";
import useNotificationStore from "../stores/useNotificationStore";
import AccountSettings from "../components/AccountsSettings";

export default function SettingsPage() {
    const userData = useUserStore((state) => state.userData);
    const fetchUser = useUserStore((state) => state.fetchUser);
    const updateUserProfile = useUserStore((state) => state.updateUserProfile);
    const showNotification = useNotificationStore((state) => state.showNotification);

    const [draftProfile, setDraftProfile] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [saveStatus, setSaveStatus] = useState('idle');
    const [profileMode, setProfileMode] = useState('display');
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (userData) {
            setDraftProfile(userData);
        }
    }, [userData]);

    // Read '?tab=' query parameter from URL on load to switch tabs automatically
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        
        const validTabs = ['profile', 'appearance', 'account', 'notifications'];
        if (tabParam && validTabs.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Flattens structure so Zod validator matches inputs exactly
    const flattenProfileForValidation = (data) => {
        if (!data || !data.profile) return {};
        return {
            fullName: data.profile.fullName || '',
            bio: data.profile.bio || '',
            location: data.profile.location || '',
            company: data.profile.company || '',
            website: data.profile.website || '',
            isHireable: !!data.profile.isHireable,
            avatarPresetId: data.profile.avatarPresetId || 'user',
            avatarUrl: data.profile.avatarUrl || '',
            socials: {
                github: data.profile.socials?.github || '',
                linkedin: data.profile.socials?.linkedin || '',
                twitter: data.profile.socials?.twitter || ''
            }
        };
    };

    const validate = (data) => {
        const flattened = flattenProfileForValidation(data);
        const result = profileSchema.safeParse(flattened);
        if (result.success) return {};
        return result.error.format();
    };

    const updateAndValidate = (newData) => {
        setDraftProfile(newData);
        setFormErrors(validate(newData));
    };

    const handleChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        const updated = {
            ...draftProfile,
            profile: {
                ...draftProfile.profile,
                [name]: newValue
            }
        };
        updateAndValidate(updated);
    };

    const handleSocialChange = (e) => {
        if (saveStatus === 'error') setSaveStatus('idle');
        const { name, value } = e.target;
        
        const updated = {
            ...draftProfile,
            profile: {
                ...draftProfile.profile,
                socials: {
                    ...draftProfile.profile?.socials,
                    [name]: value
                }
            }
        };
        updateAndValidate(updated);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    // Helper function to read file streams as Base64 strings
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveStatus('saving');

        const errorsMap = validate(draftProfile);
        if (Object.keys(errorsMap).length > 0) {
            setFormErrors(errorsMap);
            setTouched({ fullName: true, bio: true, location: true, company: true, website: true });
            setSaveStatus('error');
            showNotification('Please correct validation issues.', 'error');
            return;
        }

        let finalAvatarUrl = draftProfile.profile.avatarUrl;

        // If the user selected a local file, convert it to Base64 before posting
        if (avatarFile) {
            try {
                finalAvatarUrl = await convertFileToBase64(avatarFile);
            } catch (err) {
                console.error("Local file processing failure:", err);
                showNotification("Could not read image file.", "error");
                setSaveStatus('error');
                return;
            }
        }

        // Flat keys matched exactly to standard ALLOWED_PROFILE_FIELDS on backend
        const submissionPayload = {
            fullName: draftProfile.profile.fullName || '',
            bio: draftProfile.profile.bio || '',
            location: draftProfile.profile.location || '',
            company: draftProfile.profile.company || '',
            website: draftProfile.profile.website || '',
            isHireable: draftProfile.profile.isHireable || false,
            avatarPresetId: draftProfile.profile.avatarPresetId || 'user',
            avatarUrl: finalAvatarUrl || '',
            socials: {
                github: draftProfile.profile.socials?.github || '',
                linkedin: draftProfile.profile.socials?.linkedin || '',
                twitter: draftProfile.profile.socials?.twitter || ''
            }
        };

        // Call the store using standard JSON
        const result = await updateUserProfile(submissionPayload);

        if (result.success) {
            setDraftProfile(result.data);
            setSaveStatus('success');
            showNotification('Profile updated successfully!', 'success');
            setAvatarFile(null); // Clear the active file
            setTimeout(() => {
                setProfileMode('display');
                setSaveStatus('idle');
            }, 1200);
        } else {
            setSaveStatus('error');
            showNotification(result.error?.detail || 'Failed to sync data.', 'error');
        }
    };

    const onEditClick = () => {
        setProfileMode('edit');
        setDraftProfile(userData);
        setFormErrors({});
        setTouched({});
    };

    const onCancel = () => {
        setDraftProfile(userData);
        setProfileMode('display');
        setFormErrors({});
        setTouched({});
    };

    const getTabClassName = (tab) => {
        const isActive = activeTab === tab;
        const baseClasses = 'relative z-10 w-full text-center lg:text-left py-2 px-3 transition-colors duration-200 rounded-md text-sm font-medium';
        const activeClasses = 'font-bold text-slate-800 dark:text-slate-100';
        const inactiveClasses = 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50';

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    if (!userData) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 w-48 rounded mb-6" />
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Settings</h1>

            <div className="flex flex-col lg:flex-row gap-10 mt-8">
                {/* Side Tab Layout */}
                <div className="w-full lg:w-64 lg:sticky top-8 self-start">
                    <ul className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1 lg:grid-cols-1 lg:bg-transparent lg:p-0">
                        {['profile', 'appearance', 'account', 'notifications'].map(tab => (
                            <li key={tab} className="relative flex">
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={getTabClassName(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>

                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="active-settings-tab"
                                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-md z-0"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content Panel */}
                <div className="flex-grow max-w-3xl">
                    {activeTab === 'profile' && (
                        profileMode === 'display'
                            ? <ProfileDisplay formData={userData} onEditClick={onEditClick} />
                            : <ProfileSettings
                                errors={formErrors}
                                touched={touched}
                                formData={draftProfile || userData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                saveStatus={saveStatus}
                                setAvatarFile={setAvatarFile}
                                onCancel={onCancel}
                                setFormData={setDraftProfile}
                                handleSocialChange={handleSocialChange}
                                handleBlur={handleBlur}
                            />
                    )}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                    {activeTab === 'account' && <AccountSettings />}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Notifications</h3>
                            <p className="text-sm text-slate-400">Notification preferences coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}