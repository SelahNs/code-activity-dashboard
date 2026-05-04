import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signupSchema } from '../lib/validation';
import { apiFetch } from '../lib/api';
import { FiEye, FiEyeOff, FiMail } from 'react-icons/fi';
import { AiFillGithub } from 'react-icons/ai';
import useNotificationStore from '../stores/useNotificationStore';

export const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const feedback = ['Weak', 'Still weak', 'Fair', 'Good', 'Strong'][score];
        return { score, feedback };
    };
    const { score, feedback } = getStrength();
    const color = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][score];
    const width = `${(score / 4) * 100}%`;
    return (
        <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <motion.div
                    className={`h-1.5 rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Strength: <span className="font-medium">{feedback}</span>
            </p>
        </div>
    );
};

export const FormError = ({ message }) => (
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

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', password: '', confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [shakeButton, setShakeButton] = useState(0);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const showNotification = useNotificationStore((state) => state.showNotification);

    const handleGithubClick = () => {
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=Iv23lisg4lKqAlS3Ox26&scope=repo,user';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
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
            console.log('Zod errors:', JSON.stringify(formattedErrors, null, 2));
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
            setTouched({
                fullName: true, username: true,
                email: true, password: true, confirmPassword: true
            });
            setShakeButton(s => s + 1);
            return;
        }

        setSubmitStatus('loading');

        try {
            // Send as JSON — matches your backend's request.body
            const payload = {
                email: result.data.email,
                username: result.data.username,
                password: result.data.password,
                // only include fullname if the user actually typed one
                ...(result.data.fullName?.trim() && {
                    fullname: result.data.fullName.trim()
                })
            };

            await apiFetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // Success — show the "check your email" screen
            setIsSubmitted(true);

        } catch (error) {
            const errorData = error.data || {};

            if (error.status === 400 && errorData.errors) {
                // Backend returned field-specific errors
                // errorData.errors looks like: { email: ['message'], username: ['message'] }
                const newErrors = {};
                for (const key in errorData.errors) {
                    newErrors[key] = { _errors: errorData.errors[key] };
                }
                setFormErrors(newErrors);
                setShakeButton(p => p + 1);

            } else {
                // Something unexpected — show a notification
                showNotification(
                    errorData.error || 'An unknown error occurred. Please try again.',
                    'error'
                );
            }
        } finally {
            setSubmitStatus('idle');
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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
                            <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
                                Check Your Inbox
                            </h2>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                We've sent a verification link to{' '}
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {formData.email}
                                </span>{' '}
                                to activate your account.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="form">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                    Create your Account
                                </h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Join the CodeDash community.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleGithubClick}
                                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-slate-700
                                           bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold
                                           shadow-md shadow-black/20 hover:bg-slate-800 dark:hover:bg-slate-100
                                           hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20
                                           transition-all duration-300 ease-in-out"
                            >
                                <AiFillGithub className="w-6 h-6" />
                                <span>Continue with GitHub</span>
                                <span className="text-xs font-normal opacity-60">(Recommended)</span>
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-sm uppercase tracking-widest text-slate-400">
                                    <span className="px-3 bg-white dark:bg-slate-800">Or email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Full Name{' '}
                                        <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
                                    </label>
                                    <input
                                        id="fullName" name="fullName" type="text"
                                        value={formData.fullName}
                                        onChange={handleChange} onBlur={handleBlur}
                                        placeholder="e.g., Jane Doe"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {formErrors.fullName?._errors[0] && touched.fullName &&
                                            <FormError message={formErrors.fullName._errors[0]} />}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Username
                                    </label>
                                    <input
                                        id="username" name="username" type="text"
                                        value={formData.username}
                                        onChange={handleChange} onBlur={handleBlur}
                                        placeholder="e.g., janedoe99"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {formErrors.username?._errors[0] && touched.username &&
                                            <FormError message={formErrors.username._errors[0]} />}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Email Address
                                    </label>
                                    <input
                                        id="email" name="email" type="email"
                                        value={formData.email}
                                        onChange={handleChange} onBlur={handleBlur}
                                        placeholder="you@example.com"
                                        className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {formErrors.email?._errors[0] && touched.email &&
                                            <FormError message={formErrors.email._errors[0]} />}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="password" name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange} onBlur={handleBlur}
                                            className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {formData.password.length > 0 &&
                                        <PasswordStrengthIndicator password={formData.password} />}
                                    <AnimatePresence>
                                        {formErrors.password?._errors[0] && touched.password &&
                                            <FormError message={formErrors.password._errors[0]} />}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Confirm Password
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="confirmPassword" name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange} onBlur={handleBlur}
                                            className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {formErrors.confirmPassword?._errors[0] && touched.confirmPassword &&
                                            <FormError message={formErrors.confirmPassword._errors[0]} />}
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    key={shakeButton}
                                    animate={{
                                        x: [0, -8, 8, -6, 6, -4, 4, 0],
                                        transition: { duration: 0.4, ease: 'easeInOut' }
                                    }}
                                >
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'loading'}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitStatus === 'loading' ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </motion.div>
                            </form>

                            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.main>
    );
}