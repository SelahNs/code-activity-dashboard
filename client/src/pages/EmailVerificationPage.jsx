// src/pages/EmailVerificationPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import useNotificationStore from '../stores/useNotificationStore';

const Spinner = () => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'fit-content', height: 'fit-content' }}
    >
        <FiLoader className="w-12 h-12 text-blue-500" />
    </motion.div>
);

export default function EmailVerificationPage({ onLoginSuccess }) {
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const { key } = useParams();
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.showNotification);

    useEffect(() => {
        // Only check for the key. This is the simplest and safest check.
        if (!key) {
            setVerificationStatus('error');
            return;
        }

        const verifyEmailKey = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/_allauth/app/v1/auth/email/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key }),
                });

                // --- THIS IS THE CORRECTED LOGIC ---
                // The response body contains important data regardless of success or failure.
                // We must always try to parse it.
                const data = await response.json();

                // A successful verification might return 200 OK (if login is immediate)
                // or 401 (if it's just a confirmation). We accept BOTH as success.
                if (response.status === 200 || response.status === 401) {
                    setVerificationStatus('success');
                    console.log(data);

                    // Check if the success response contains user data and tokens.
                    if (data.user && data.access_token) {
                        // This is the new "login on verify" flow
                        onLoginSuccess(data.user, false);
                        localStorage.setItem('accessToken', data.access_token);
                        localStorage.setItem('refreshToken', data.refresh_token);
                        showNotification(`Welcome! Your email has been verified.`, 'success');
                        setTimeout(() => {
                            navigate('/'); // Redirect to dashboard
                        }, 3000);
                    } else {
                        // This is the old "just verify" flow
                        showNotification('Your email has been successfully verified!', 'success');
                        setTimeout(() => {
                            navigate('/login'); // Redirect to login page
                        }, 3000);
                    }
                } else {
                    // All other statuses are treated as errors.
                    throw new Error(data.detail || 'Verification failed. The link may be expired.');
                }
            } catch (error) {
                setVerificationStatus('error');
                showNotification(error.message, 'error');
            }
        };

        const timer = setTimeout(() => {
            verifyEmailKey();
        }, 500);

        return () => clearTimeout(timer);
    }, [key, navigate, showNotification, onLoginSuccess]);

    const renderContent = () => {
        switch (verificationStatus) {
            case 'success':
                return (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <FiCheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark-text-slate-100">Verification Successful!</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">You will be redirected shortly.</p>
                    </motion.div>
                );
            case 'error':
                return (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <FiAlertCircle className="w-16 h-16 text-red-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Failed</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">The verification link is invalid or has expired.</p>
                    </motion.div>
                );
            case 'verifying':
            default:
                return (
                    <motion.div
                        key="verifying"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <Spinner />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Verifying Your Email...</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Please wait a moment.</p>
                    </motion.div>
                );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full"
                style={{ minHeight: '220px' }}
            >
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}