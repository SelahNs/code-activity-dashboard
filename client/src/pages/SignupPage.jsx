// src/pages/SignupPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signupSchema } from '../lib/validation';
import { apiFetch } from '../lib/api';
import { FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { AiFillGithub, AiOutlineGoogle } from 'react-icons/ai';
import useNotificationStore from '../stores/useNotificationStore';

export const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        let feedback = "Weak";
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        switch (score) {
            case 1: feedback = "Still weak"; break;
            case 2: feedback = "Fair"; break;
            case 3: feedback = "Good"; break;
            case 4: feedback = "Strong"; break;
            default: feedback = "Weak";
        }
        return { score, feedback };
    };
    const { score, feedback } = getStrength();
    const color = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][score - 1] || 'bg-gray-200';
    const width = `${(score / 4) * 100}%`;
    return (
        <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <motion.div className={`h-1.5 rounded-full ${color}`} initial={{ width: 0 }} animate={{ width }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Strength: <span className="font-medium">{feedback}</span></p>
        </div>
    );
};

export const FormError = ({ message }) => (
    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="mt-1 text-sm text-red-600">
        {message}
    </motion.p>
);

export default function SignupPage() {
    const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [shakeButton, setShakeButton] = useState(0);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const showNotification = useNotificationStore((state) => state.showNotification);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const newTouched = { ...touched, [name]: true };
        setTouched(newTouched);
        const result = signupSchema.safeParse(formData);
        if (result.success) {
            setFormErrors({});
        } else {
            const formattedErrors = result.error.format();
            const newVisibleErrors = {};
            for (const key in newTouched) {
                if (formattedErrors[key]) {
                    newVisibleErrors[key] = formattedErrors[key];
                }
            }
            setFormErrors(newVisibleErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
            setFormErrors(result.error.format());
            setTouched({ fullName: true, username: true, email: true, password: true, confirmPassword: true });
            setShakeButton(s => s + 1);
            return;
        }

        setSubmitStatus('loading');
        try {
            // --- REFINEMENT 1: Conditionally add fullName to the payload ---
            // This is a more robust way to handle an optional field.
            const payload = {
                email: result.data.email,
                username: result.data.username,
                password: result.data.password,
                password2: result.data.confirmPassword,
            };

            if (result.data.fullName && result.data.fullName.trim() !== '') {
                payload.fullName = result.data.fullName;
            }

            await apiFetch('/_allauth/app/v1/auth/signup', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setIsSubmitted(true);
            showNotification("Account created! Please check your email to verify.", "success");

        } catch (error) {
            if (error.status === 401) {
                setIsSubmitted(true);
                showNotification("Account created! Please check your email to verify.", "success");
                return;
            }
            const errorData = error.data || {};
            const newErrors = {};
            if (error.status === 400 && (errorData.errors || Object.keys(errorData).length > 0)) {
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    for (const err of errorData.errors) {
                        newErrors[err.param] = { _errors: [err.message] };
                    }
                } else {
                    for (const key in errorData) {
                        if (Array.isArray(errorData[key])) {
                            newErrors[key] = { _errors: errorData[key] };
                        }
                    }
                }
                setFormErrors(newErrors);
                setShakeButton(p => p + 1);
            } else {
                showNotification(errorData.detail || 'An unknown error occurred.', 'error');
            }
        } finally {
            setSubmitStatus('idle');
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4"
        >
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <AnimatePresence mode="wait">
                    {isSubmitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="text-center"
                        >
                            <FiMail className="w-16 h-16 text-green-500 mx-auto" />
                            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">Check Your Inbox</h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                We've sent a verification link to <span className="font-semibold text-slate-700 dark:text-slate-300">{formData.email}</span> to activate your account.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Create your Account</h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join the CodeDash community.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div>
                                    {/* --- REFINEMENT 2: Visually mark the field as optional --- */}
                                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Full Name <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                                    </label>
                                    <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Jane Doe"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <AnimatePresence>{formErrors.fullName?._errors[0] && touched.fullName && <FormError message={formErrors.fullName._errors[0]} />}</AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                                    <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., janedoe99"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <AnimatePresence>{formErrors.username?._errors[0] && touched.username && <FormError message={formErrors.username._errors[0]} />}</AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <AnimatePresence>{formErrors.email?._errors[0] && touched.email && <FormError message={formErrors.email._errors[0]} />}</AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                    <div className="relative mt-1">
                                        <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} onBlur={handleBlur}
                                            className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {formData.password.length > 0 && <PasswordStrengthIndicator password={formData.password} />}
                                    <AnimatePresence>{formErrors.password?._errors[0] && touched.password && <FormError message={formErrors.password._errors[0]} />}</AnimatePresence>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                    <div className="relative mt-1">
                                        <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                                            className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <AnimatePresence>{formErrors.confirmPassword?._errors[0] && touched.confirmPassword && <FormError message={formErrors.confirmPassword._errors[0]} />}</AnimatePresence>
                                </div>
                                <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                                    <button type="submit" disabled={submitStatus === 'loading'}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {submitStatus === 'loading' ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </motion.div>
                            </form>
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">Or sign up with</span></div>
                                </div>
                                <div className="mt-6 grid grid-cols-1 gap-3">
                                    <button type="button" onClick={() => alert("GitHub signup coming soon!")}
                                        className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                                        <AiFillGithub className="w-5 h-5 mr-2" />
                                        Continue with GitHub
                                    </button>
                                    <button type="button" onClick={() => alert("Google signup coming soon!")}
                                        className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                                        <AiOutlineGoogle className="w-5 h-5 mr-2" />
                                        Continue with Google
                                    </button>
                                </div>
                            </div>
                            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                Already have an account?{' '}<Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Log in</Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    );
}