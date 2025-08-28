import { motion } from "framer-motion"
import { useState } from "react"
import AppearanceSettings from "../components/AppearanceSettings"
import ProfileSettings from "../components/ProfileSettings"
import ProfileDisplay from "../components/ProfileDisplay"

export default function SettingsPage() {
    const [formData, setFormData] = useState({ fullName: '', username: '', bio: '', avatarUrl: '', isHireable: false, socialLinks: { github: '', linkedin: '', twitter: '' } })
    const [saveStatus, setSaveStatus] = useState('idle');
    const [profileMode, setProfileMode] = useState('display');

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prevState => ({
            ...prevState,
            [name]: newValue
        }));
    }

    function handleSocialChange(e) {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, socialLinks: { ...prevState.socialLinks, [name]: value } }))
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => {
                setProfileMode('display');
                setSaveStatus('idle')
            }, 1500);
        }, 2000);
        console.log(formData);
        // textHandler();
    }

    function onEditClick() {
        setProfileMode('edit')
    }
    function onCancel() {
        setProfileMode('display')
    }

    const [activeTab, setActiveTab] = useState('profile');
    function getClassName(tab) {
        return `w-full relative z-10 text-slate-700 dark:text-slate-200 text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${tab === activeTab ? 'font-bold' : ''}`;
    }

    return (
        <main className="px-10">
            <motion.h1 layoutId="settings-title" className="text-3xl font-bold text-gray-800 dark:text-slate-200 mt-4">Settings</motion.h1>
            <div className="flex gap-10 mt-8 ">
                <div className="w-64 sticky top-8" >
                    <ul className="flex flex-col gap-1 relative">
                        <li className="relative">
                            <button onClick={() => setActiveTab('profile')} className={getClassName('profile')}>
                                Profile
                            </button>
                            {activeTab === 'profile' && <motion.div layoutId="active-settings-tab" className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-lg z-0"></motion.div>}
                        </li>
                        <li className="relative">
                            <button onClick={() => setActiveTab('appearance')} className={getClassName('appearance')}>
                                Appearance
                            </button>
                            {activeTab === 'appearance' && <motion.div layoutId="active-settings-tab" className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-lg z-0"></motion.div>}
                        </li>
                        <li className="relative">
                            <button onClick={() => setActiveTab('account')} className={getClassName('account')}>
                                Account
                            </button>
                            {activeTab === 'account' && <motion.div layoutId="active-settings-tab" className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-lg z-0"></motion.div>}
                        </li>
                        <li className="relative">
                            <button onClick={() => setActiveTab('notifications')} className={getClassName('notifications')}>
                                Notifications
                            </button>
                            {activeTab === 'notifications' && <motion.div layoutId="active-settings-tab" className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-lg z-0"></motion.div>}
                        </li>
                    </ul>
                </div>
                <div className="flex-grow max-w-3xl">
                    {activeTab === 'profile' && (profileMode === 'display' ? <ProfileDisplay formData={formData} onEditClick={onEditClick} /> : <ProfileSettings handleSocialChange={handleSocialChange} setFormData={setFormData} onCancel={onCancel} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} saveStatus={saveStatus} />)}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                    {activeTab === 'account' && <div>Account Settings</div>}
                    {activeTab === 'notifications' && <div>Notification Settings</div>}
                </div>
            </div>
        </main>
    )
}