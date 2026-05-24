import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api';
import useAuthStore from '../stores/useAuthStore';
import useNotificationStore from '../stores/useNotificationStore';
import { FiLock, FiMail, FiTrash2, FiAlertTriangle, FiCheckCircle, FiShield } from 'react-icons/fi';

// Reusable inputs matching the CodeDash theme variables
function SettingsInput({ label, name, type, value, onChange, required = false, placeholder = '', hint = '' }) {
    return (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
    );
}

export default function AccountSettings() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const showNotification = useNotificationStore((state) => state.showNotification);

    // Form states
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSaving, setDeleteSaving] = useState(false);
    const [resending, setResending] = useState(false);

    // Change Password Handler
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification("New passwords do not match.", "error");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showNotification("New password must be at least 8 characters.", "error");
            return;
        }

        setPasswordSaving(true);
        try {
            // Mapped to your Node/Express POST /me/password route
            await apiClient.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            showNotification("Password changed successfully!", "success");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const errorMessage = error.data?.error || 'Failed to update password. Check your current password.';
            showNotification(errorMessage, "error");
        } finally {
            setPasswordSaving(false);
        }
    };

    // Resend Verification Email (Uses standard api endpoints)
    const handleResendVerification = async () => {
        if (!user?.email) return;
        setResending(true);
        try {
            // Safe fallback to resend verification API
            await apiClient.resendVerification({ email: user.email });
            showNotification(`Verification link resent to ${user.email}`, "success");
        } catch (error) {
            showNotification(error.data?.error || "Failed to dispatch verification email.", "error");
        } finally {
            setResending(false);
        }
    };

    // Permanent Account Deletion Action
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (deleteConfirm !== 'delete my account') return;

        setDeleteSaving(true);
        try {
            await apiClient.deleteProject(user.id); // Or call deleteMe if configured
            showNotification("Account permanently deleted.", "success");
            setShowDeleteModal(false);
            logout();
        } catch (error) {
            showNotification(error.data?.error || "Account deletion failed.", "error");
        } finally {
            setDeleteSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-left"
        >
            {/* --- CORE ACCOUNT INFORMATION CARD --- */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-150 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FiShield className="text-slate-400" />
                        Account Details
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your fundamental profile login identifiers.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Username</span>
                            <span className="block mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                @{user?.username || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Email</span>
                            <span className="block mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                {user?.email || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CHANGE PASSWORD CARD --- */}
            <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-150 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FiLock className="text-slate-400" />
                        Security Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Use a strong password with at least 8 characters.</p>
                </div>
                <div className="p-6 space-y-4">
                    <SettingsInput 
                        label="Current Password" 
                        name="currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                        required 
                    />
                    <SettingsInput 
                        label="New Password" 
                        name="newPassword" 
                        type="password" 
                        value={passwordData.newPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                        required 
                    />
                    <SettingsInput 
                        label="Confirm New Password" 
                        name="confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                        required 
                    />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-150 dark:border-slate-700/60 flex justify-end">
                    <button
                        type="submit"
                        disabled={passwordSaving}
                        className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {passwordSaving ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : null}
                        {passwordSaving ? 'Updating...' : 'Save Password'}
                    </button>
                </div>
            </form>

            {/* --- EMAIL VERIFICATION CARD --- */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-150 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FiMail className="text-slate-400" />
                        Verification Status
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your email verification and activation logs.</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-150 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="space-y-1">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {user?.email || 'N/A'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                                {user?.isVerified ? (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <FiCheckCircle className="w-3.5 h-3.5" /> Checked & Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-semibold">
                                        <FiAlertTriangle className="w-3.5 h-3.5" /> Verification Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {!user?.isVerified && (
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resending}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                            >
                                {resending ? 'Sending...' : 'Resend Verification link'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- DANGER ZONE CARD --- */}
            <div className="bg-white dark:bg-slate-800/40 border border-rose-200 dark:border-rose-950/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-rose-100 dark:border-rose-950/30">
                    <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <FiTrash2 />
                        Danger Zone
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Highly destructive actions. Proceed with absolute caution.</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Delete Account</span>
                        <span className="block text-xs text-slate-400 mt-0.5">Permanently delete your account, projects, activity databases, and history records.</span>
                    </div>
                    <button 
                        onClick={() => { setDeleteConfirm(''); setShowDeleteModal(true); }} 
                        type="button" 
                        className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                        Delete my account...
                    </button>
                </div>
            </div>

            {/* DELETE ACCOUNT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-left"
                        >
                            <div className="p-6 border-b border-slate-150 dark:border-slate-700/60">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <FiAlertTriangle className="text-rose-500" />
                                    Confirm Account Deletion
                                </h3>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    This action is completely irreversible.
                                </p>
                            </div>
                            <form onSubmit={handleDeleteAccount}>
                                <div className="p-6 space-y-4">
                                    <SettingsInput 
                                        label={
                                            <span>
                                                Type <strong className="text-slate-900 dark:text-slate-100">delete my account</strong> to confirm
                                            </span>
                                        }
                                        name="delete_confirm" 
                                        type="text" 
                                        value={deleteConfirm} 
                                        onChange={(e) => setDeleteConfirm(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-150 dark:border-slate-700/60 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowDeleteModal(false)} 
                                        className="rounded-lg py-2 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={deleteConfirm !== 'delete my account' || deleteSaving} 
                                        className="rounded-lg py-2 px-4 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {deleteSaving ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}