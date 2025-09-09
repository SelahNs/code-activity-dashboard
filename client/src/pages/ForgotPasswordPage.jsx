// src/pages/ForgotPasswordPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { apiFetch } from '../lib/api';
import useNotificationStore from '../stores/useNotificationStore';

// Re-using the FormError component for consistency with SignupPage
const FormError = ({ message }) => (
    <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="mt-1 text-sm text-red-600"
    >
        {message}
    </motion.p>
);

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'error'
    const [shakeButton, setShakeButton] = useState(0);
    const showNotification = useNotificationStore((state) => state.showNotification);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setFormError('Email address cannot be empty.');
            setShakeButton(p => p + 1);
            return;
        }
        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            setFormError('Please enter a valid email address.');
            setShakeButton(p => p + 1);
            return;
        }

        setStatus('loading');
        try {
            await apiFetch('/_allauth/app/v1/auth/password/request', {
                method: 'POST',
                body: JSON.stringify({ email: trimmedEmail }),
            });

            setEmailSent(true);

        } catch (error) {
            setStatus('error');
            const errorMessage = error.data?.detail || 'An unexpected error occurred. Please try again.';
            showNotification(errorMessage, 'error');
            console.error('Error sending reset link:', error);

        } finally {
            setStatus('idle');
        }
    };

    const handleTryAgain = () => {
        setEmailSent(false);
        setEmail('');
        setFormError('');
        setStatus('idle');
    };


    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
        >
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">

                <AnimatePresence mode="wait">
                    {!emailSent ? (
                        // --- STATE 1: SHOW THE FORM ---
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Reset your password</h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your email and we'll send you a link to get back into your account.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {formError && <FormError message={formError} />}
                                    </AnimatePresence>
                                </div>

                                <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                                    <button type="submit" disabled={status === 'loading'}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {status === 'loading' ? 'Sending...' : 'Send Instructions'}
                                    </button>
                                </motion.div>
                            </form>
                            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                Remembered your password?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    Back to Login
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        // --- STATE 2: SHOW THE SUCCESS MESSAGE ---
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">Check your inbox</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                If an account exists for <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>, you will receive an email with reset instructions.
                            </p>

                            {/* --- THIS IS YOUR EXCELLENT SUGGESTION --- */}
                            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                                Don't see the email? Be sure to check your spam folder.
                            </p>

                            <div className="mt-6">
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    &larr; Back to Login
                                </Link>
                                <p className="mt-2 text-xs text-slate-400">
                                    Typed the wrong email?{' '}
                                    <button
                                        onClick={handleTryAgain}
                                        className="font-medium text-blue-600 hover:underline"
                                    >
                                        Try again
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    );
}