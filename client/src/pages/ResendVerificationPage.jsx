import { useState } from "react";
import { motion } from "framer-motion";
import { resendVerificationSchema } from "../lib/validation";
import { apiFetch } from "../lib/api";
import { FiCheckCircle } from 'react-icons/fi';

export default function ResendVerificationPage() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [isSubmitted, setIsSubmitted] = useState(false);
    // --- 1. Add state for the shake animation ---
    const [shakeButton, setShakeButton] = useState(0);

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = resendVerificationSchema.safeParse({ email });

        if (!result.success) {
            const formattedErrors = result.error.format();
            setErrors({ email: formattedErrors.email?._errors[0] });
            // --- 2. Trigger the shake animation on error ---
            setShakeButton(p => p + 1);
            return;
        }

        setSubmitStatus('loading');

        try {
            await apiFetch('/api/resend-verification/', {
                method: 'POST',
                body: JSON.stringify({ email: result.data.email }),
            });

            setIsSubmitted(true);

        } catch (error) {
            console.error("An unexpected error occurred:", error);
        } finally {
            setSubmitStatus('idle');
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
        >
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                {isSubmitted ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                            Request Received
                        </h2>
                        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                            If an account exists for <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>, a new verification link has been sent.
                        </p>
                        <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                If you don't receive an email within a few minutes, please check your spam folder or you can try logging in.
                            </p>
                        </div>
                        <div className="mt-8">
                            <a
                                href="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                            >
                                &larr; Back to Login
                            </a>
                        </div>
                    </motion.div>
                ) : (
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Resend Verification Link</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Enter your email to receive a new link.</p>
                        </div>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>
                            <div className="mt-6">
                                {/* --- 3. Wrap the button with motion.div for the animation --- */}
                                <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'loading'}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitStatus === 'loading' ? 'Sending...' : 'Send New Link'}
                                    </button>
                                </motion.div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </motion.main>
    );
}