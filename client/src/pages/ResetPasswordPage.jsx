// src/pages/ResetPasswordPage.jsx

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { apiFetch } from '../lib/api';
import useNotificationStore from '../stores/useNotificationStore';
import { PasswordStrengthIndicator, FormError } from './SignupPage';
import { FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi'; // Added FiAlertTriangle

const passwordResetSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const { uid, key } = useParams();
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.showNotification);

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState('idle');
    const [shakeButton, setShakeButton] = useState(0);

    // --- REFINEMENT 1: State to control the page view (form vs. error screen) ---
    const [pageState, setPageState] = useState('form');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            validateForm();
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateForm();
    };

    const validateForm = () => {
        const result = passwordResetSchema.safeParse(formData);
        if (!result.success) {
            const newErrors = result.error.format();
            setFormErrors(newErrors);
            return false;
        }
        setFormErrors({});
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();
        setTouched({ password: true, confirmPassword: true });

        if (!isValid) {
            setShakeButton(p => p + 1);
            return;
        }

        setStatus('loading');
        try {
            await apiFetch(`/_allauth/app/v1/auth/password/reset`, {
                method: 'POST',
                body: JSON.stringify({ key, password: formData.password }),
            });

            // --- REFINEMENT 2: Reverted notification text for consistency ---
            showNotification("Your password has been reset successfully! Please log in.", 'success');
            navigate('/');

        } catch (error) {
            if (error.status === 401) {
                showNotification("Your password has been reset successfully! Please log in.", 'success');
                navigate('/login');
                return;
            }

            // --- REFINEMENT 3: On error, switch to the dedicated error view ---
            const errorData = error.data || {};
            const message = errorData.detail || "This link may be invalid or expired.";
            setErrorMessage(message);
            setPageState('error'); // Switch the view

            console.error("Password reset failed:", error);
        } finally {
            setStatus('idle');
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
        >
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <AnimatePresence mode="wait">
                    {pageState === 'form' ? (
                        <motion.div key="form" exit={{ opacity: 0, y: -20 }}>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Choose a new password</h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your new password must be different from previous passwords.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                {/* Form fields (no changes here) */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                    <div className="relative mt-1">
                                        <input id='password' name='password' type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} onBlur={handleBlur} required className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showPassword ? <FiEyeOff /> : <FiEye />}</button>
                                    </div>
                                    {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                                    <AnimatePresence>{formErrors.password?._errors[0] && touched.password && <FormError message={formErrors.password._errors[0]} />}</AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor='confirmPassword' className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                    <div className='relative mt-1'>
                                        <input id='confirmPassword' name='confirmPassword' type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button>
                                    </div>
                                    <AnimatePresence>{formErrors.confirmPassword?._errors[0] && touched.confirmPassword && <FormError message={formErrors.confirmPassword._errors[0]} />}</AnimatePresence>
                                </div>
                                <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                                    <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </motion.div>
                            </form>
                        </motion.div>
                    ) : (
                        // --- REFINEMENT 4: New Error View with Actionable Links ---
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">Something went wrong</h2>
                            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                                {errorMessage}
                            </p>
                            <div className="mt-8 space-y-4">
                                <Link to="/forgot-password" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                    Request a New Link
                                </Link>
                                <Link to="/login" className="font-medium text-sm text-blue-600 hover:text-blue-500 hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    );
}