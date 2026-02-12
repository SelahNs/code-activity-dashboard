// src/components/AccountSettings.jsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Assume you have an api client for making requests
import { apiClient } from '../lib/api';
import useAuthStore from '../stores/useAuthStore'; // We'll need this to get the current emails


// A reusable input component for consistency
function SettingsInput({ label, name, type, value, onChange, required = false, placeholder = '' }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="mt-1 block w-full text-gray-900 dark:text-gray-100 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500"
            />
        </div>
    );
}

// A reusable button
function SettingsButton({ children, type = 'submit', disabled = false }) {
    return (
        <button
            type={type}
            disabled={disabled}
            className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );
}


export default function AccountSettings() {
    // --- STATE MANAGEMENT ---
    const user = useAuthStore((state) => state.user); // Get the whole user object

    // --- ADD THIS LINE FOR DEBUGGING ---
    console.log("Current user state from store:", user);
    // This would come from your auth store, which gets it from the allauth API
    const userEmails = user?.user?.email || [
        { email: 'primary@example.com', primary: true, verified: true },
        { email: 'secondary-verified@example.com', primary: false, verified: true },
        { email: 'unverified@example.com', primary: false, verified: false },
    ];
    const currentUsername = useAuthStore((state) => state.user?.user?.username) || '';
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password1: '', new_password2: '' });
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState(currentUsername);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // A unified status state for all forms
    const [status, setStatus] = useState({ form: '', type: '', message: '' });

    // --- EVENT HANDLERS ---
    const handlePasswordChange = (e) => {
        if (status.form === 'password') setStatus({});
        setPasswordData({
            ...passwordData, [e.target.name]: e.target.value
        });
    }
    const handleNewEmailChange = (e) => setNewEmail(e.target.value);


    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        setStatus({ form: 'username', type: 'info', message: 'Updating...' })
    };
    // --- API SUBMISSION LOGIC (Placeholders) ---
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setStatus({ form: 'password', type: 'info', message: 'Updating password...' });
        if (passwordData.new_password1 !== passwordData.new_password2) {
            setStatus({ form: 'password', type: 'error', message: "New passwords do not match." });
            return;
        }

        try {
            const submissionData = {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password1 // Send only one new_password
            };

            await apiClient.changePassword({ submissionData });

            setStatus({ form: 'password', type: 'success', message: 'Password changed succussfully! You may need to log in again.' });
            setPasswordData({ current_password: '', new_password1: '', new_password2: '' });

        } catch (error) {
            const errorMessage = error.response?.data?.errors?.[0]?.message || 'Failed. Please check your current password.';
            setStatus({ form: 'password', type: 'error', message: errorMessage })
        }
        // TODO: Call API endpoint: POST /_allauth/password/change/
        // On success:
        // setStatus({ form: 'password', type: 'success', message: 'Password changed successfully.' });
        // setPasswordData({ current_password: '', new_password1: '', new_password2: '' });
        // On error:
        // setStatus({ form: 'password', type: 'error', message: 'Failed. Check current password.' });
    };

    const handleAddEmail = async (e) => {
        e.preventDefault();
        setStatus({ form: 'email', type: 'info', message: 'Adding...' });
        try {
            await apiClient.addEmail(newEmail);
            setStatus({
                form: 'email',
                type: 'success',
                message: `A verification link has been sent to ${newEmail}.`
            });
            setNewEmail(''); // Clear the input field on success
            // Here, you would ideally re-fetch the user's profile or email list
            // to show the new unverified email in the UI.

        } catch (error) {
            // Let's assume the error from the backend is in error.data
            const errorMessage = error.data?.email?.[0] || 'This email may already be in use or is invalid.';
            setStatus({ form: 'email', type: 'error', message: errorMessage });
        }
    };

    const handleRemoveEmail = (email) => {
        // TODO: Call API endpoint: DELETE /_allauth/email/ with { email: email }
    }

    const handleMakePrimary = (email) => {
        // TODO: Call API endpoint: POST /_allauth/email/primary/ with { email: email }
    }

    const handleResendVerification = (email) => {
        // TODO: Call API endpoint: POST /_allauth/email/resend-verification/ with { email: email }
    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        // TODO: Call API to delete account
        // This is a destructive action, be careful!
        // On success, you'll need to log the user out.
    };

    const primaryEmail = user?.user?.email || userEmails.find(e => e.primary);
    const secondaryEmails = '' ;
// || userEmails.filter(e => !e.primary) || null
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
        >
            {/* --- SECTION: CHANGE USERNAME --- */}
            <form onSubmit={handleUsernameSubmit} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Change Username</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Changing your username can have unintended side effects.</p>
                </div>
                <div className="p-6">
                    <SettingsInput
                        label="New Username"
                        name="username"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between">
                    {/* We can add a status message here if needed */}
                    <p className="text-sm text-gray-500"></p>
                    <SettingsButton>Save Username</SettingsButton>
                </div>
            </form>
            {/* --- SECTION 1: CHANGE PASSWORD --- */}
            <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Change Password</h3>
                </div>
                <div className="p-6 space-y-4">
                    <SettingsInput label="Current Password" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} required />
                    <SettingsInput label="New Password" name="new_password1" type="password" value={passwordData.new_password1} onChange={handlePasswordChange} required />
                    <SettingsInput label="Confirm New Password" name="new_password2" type="password" value={passwordData.new_password2} onChange={handlePasswordChange} required />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-end">
                    <SettingsButton>Save Password</SettingsButton>
                </div>
            </form>

            {/* --- SECTION 2: EMAIL ADDRESSES --- */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Email Addresses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your primary email is used for all notifications.</p>
                </div>
                <div className="p-6 space-y-4">
                    {/* Primary Email */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{primaryEmail.email}</span>
                            <span className="ml-2 text-xs font-semibold text-white bg-indigo-500 px-2 py-0.5 rounded-full">Primary</span>
                        </div>
                    </div>
                    {/* Secondary Emails */}
                    {secondaryEmails.map(email => (
                        <div key={email.email} className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-300">{email.email}</span>
                                {!email.verified && <span className="ml-2 text-xs font-semibold text-yellow-800 bg-yellow-100 dark:text-yellow-100 dark:bg-yellow-800/50 px-2 py-0.5 rounded-full">Unverified</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                {!email.verified && <button type="button" onClick={() => handleResendVerification(email.email)} className="text-sm text-indigo-600 hover:underline">Resend</button>}
                                {email.verified && <button type="button" onClick={() => handleMakePrimary(email.email)} className="text-sm text-indigo-600 hover:underline">Make Primary</button>}
                                <button type="button" onClick={() => handleRemoveEmail(email.email)} className="text-sm text-red-600 hover:underline">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddEmail} className="border-t border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <SettingsInput label="Add a new email" name="new_email" type="email" value={newEmail} onChange={handleNewEmailChange} placeholder="you@example.com" required />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-end">
                        <SettingsButton>Add Email</SettingsButton>
                    </div>
                </form>
            </div>

            {/* --- SECTION 3: DELETE ACCOUNT --- */}
            <div className="bg-white dark:bg-gray-800/50 border border-red-300 dark:border-red-700/50 rounded-2xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Permanently delete your account and all of your content. This action is not reversible.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-red-300 dark:border-red-700/50 flex justify-end">
                    <button onClick={() => setShowDeleteModal(true)} type="button" className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 ...">
                        Delete my account...
                    </button>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Are you absolutely sure?</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">This action cannot be undone. To confirm, please type <strong className="text-gray-800 dark:text-gray-200">delete my account</strong> below.</p>
                            <form onSubmit={handleDeleteAccount} className="mt-4 space-y-4">
                                <SettingsInput name="delete_confirm" type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-lg py-2 px-4 text-sm font-semibold ...">Cancel</button>
                                    <button type="submit" disabled={deleteConfirm !== 'delete my account'} className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 ...">Delete Account</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}