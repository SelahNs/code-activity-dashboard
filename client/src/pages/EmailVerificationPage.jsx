// src/pages/EmailVerificationPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

// --- ESSENTIAL REFINEMENT 1: Import the central auth store ---
import useAuthStore from '../stores/useAuthStore';
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

// --- ESSENTIAL REFINEMENT 1: The 'onLoginSuccess' prop is removed ---
export default function EmailVerificationPage() {
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const { key } = useParams();
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.showNotification);
    const [errorMessage, setErrorMessage] = useState("The verification link is invalid, has expired, or was already used.");

    // --- ESSENTIAL REFINEMENT 1: Get the 'login' function from our store ---
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        if (!key) {
            setVerificationStatus('error');
            return;
        }

        const verifyEmailKey = async () => {
            try {
                // --- ESSENTIAL REFINEMENT 2: Use the environment variable for the URL ---
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/_allauth/app/v1/auth/email/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key }),
                });

                const data = await response.json();

                // --- YOUR CORRECT LOGIC IS PRESERVED EXACTLY AS YOU WROTE IT ---
                if (response.status === 200 || response.status === 401) {
                    setVerificationStatus('success');

                    if (data.user && data.access_token) {
                        // --- ESSENTIAL REFINEMENT 1: Use the auth store instead of localStorage ---
                        login(data, true); // Use the central login function. Set "Remember Me" to true.
                        showNotification(`Welcome! Your email has been verified.`, 'success');
                        setTimeout(() => {
                            navigate('/'); // Redirect to home/dashboard
                        }, 3000);
                    } else {
                        // This is the "just verify" flow
                        showNotification('Your email has been successfully verified! Please log in.', 'success');
                        setTimeout(() => {
                            navigate('/login'); // Redirect to login page
                        }, 3000);
                    }
                } else {
                    throw new Error(data.detail || 'Verification failed. The link may be invalid or expired.');
                
                }
            } catch (error) {
                setErrorMessage(error.message);
                setVerificationStatus('error');
            }
        };

        const timer = setTimeout(verifyEmailKey, 500);

        return () => clearTimeout(timer);
        // --- ESSENTIAL REFINEMENT 1: Update the dependency array ---
    }, [key, navigate, showNotification, login]);

    const renderContent = () => {
        switch (verificationStatus) {
            case 'success':
                return (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <FiCheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Successful!</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">You will be redirected shortly.</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
                            <motion.div
                                className="bg-green-500 h-1.5 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>
                );
            case 'error':
                return (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        <FiAlertCircle className="w-16 h-16 text-red-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">Verification Failed</h1>
                        {/* --- ESSENTIAL REFINEMENT 3: Removed the confusing button, as you rightly pointed out --- */}
                        <p className="mt-2 text-slate-500 dark:text-slate-400">{errorMessage}</p>
                        <div className="mt-6 flex flex-col items-center space-y-4">
                            {/* This button is the most important addition */}
                            <button
                                onClick={() => navigate('/resend-verification')} // Navigate to a new page/component
                                className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Get a New Verification Link
                            </button>
                            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                Already verified?{' '}
                                <a href="/login" className="font-medium text-blue-500 hover:underline">
                                    Log In
                                </a>
                            </p>
                        </div>
                    </motion.div>
                );
            case 'verifying':
            default:
                return (
                    <motion.div
                        key="verifying"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
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