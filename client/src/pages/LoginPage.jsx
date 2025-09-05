// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema } from '../lib/validation';
import { apiFetch } from '../lib/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import useAuthStore from '../stores/useAuthStore';
import useNotificationStore from '../stores/useNotificationStore';

const FormError = ({ message }) => (
    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }} className="mt-1 text-sm text-red-600">
        {message}
    </motion.p>
);

export default function LoginPage() {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [shakeButton, setShakeButton] = useState(0);
    const [rememberMe, setRememberMe] = useState(true); // State for the "Remember Me" checkbox
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const showNotification = useNotificationStore((state) => state.showNotification);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        if (formErrors[name] || formErrors._general) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                delete newErrors._general;
                return newErrors;
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const newTouched = { ...touched, [name]: true };
        setTouched(newTouched);
        const result = loginSchema.safeParse(formData);
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
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            setFormErrors(result.error.format());
            setTouched({ identifier: true, password: true });
            setShakeButton(p => p + 1);
            return;
        }

        setSubmitStatus('loading');
        try {
            const { identifier, password } = result.data;

            // A simple regex to check if the identifier contains an '@' symbol.
            const isEmail = /@/.test(identifier);

            // Build the payload dynamically
            const payload = {
                password: password,
            };

            if (isEmail) {
                payload.email = identifier;
            } else {
                payload.username = identifier;
            }

            const response = await apiFetch('/_allauth/app/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            // On successful login, pass the API response and the 'rememberMe' state to the auth store
            login(response, rememberMe);

            navigate('/');

        } catch (error) {
            const errorData = error.data || {};
            const newErrors = {};

            if (error.status === 400 && Object.keys(errorData).length > 0) {
                for (const key in errorData) {
                    if (key === 'non_field_errors' || key === 'detail') {
                        newErrors._general = { _errors: Array.isArray(errorData[key]) ? errorData[key] : [errorData[key]] };
                    } else if (Array.isArray(errorData[key])) {
                        newErrors[key] = { _errors: errorData[key] };
                    }
                }
                setFormErrors(newErrors);
            } else {
                showNotification(error.message || 'An unknown server error occurred.', 'error');
            }
            setShakeButton(p => p + 1);
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
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Log in to access your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <AnimatePresence>
                        {formErrors._general?._errors[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm"
                            >
                                {formErrors._general._errors[0]}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email or Username</label>
                        <input id="identifier" name="identifier" type="text" value={formData.identifier}
                            onChange={handleChange} onBlur={handleBlur}
                            className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        <AnimatePresence>{formErrors.identifier?._errors[0] && touched.identifier && <FormError message={formErrors.identifier._errors[0]} />}</AnimatePresence>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative mt-1">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password}
                                onChange={handleChange} onBlur={handleBlur}
                                className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        <AnimatePresence>{formErrors.password?._errors[0] && touched.password && <FormError message={formErrors.password._errors[0]} />}</AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Forgot your password?</Link>
                        </div>
                    </div>

                    <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                        <button type="submit" disabled={submitStatus === 'loading'}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitStatus === 'loading' ? 'Logging In...' : 'Log In'}
                        </button>
                    </motion.div>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}<Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign up</Link>
                </p>
            </div>
        </motion.main>
    );
}