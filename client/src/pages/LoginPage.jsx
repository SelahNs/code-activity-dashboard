// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema } from '../lib/validation';
import { apiFetch } from '../lib/api';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { AiFillGithub, AiOutlineGoogle } from 'react-icons/ai'; // Added Google Icon
import { email } from 'zod';

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

export default function LoginPage({ onLoginSuccess }) {
    const [formData, setFormData] = useState({ identifier: '', password: '', rememberMe: false });
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [loginError, setLoginError] = useState('');
    const [shakeButton, setShakeButton] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prevState => ({ ...prevState, [name]: newValue }));
        if (loginError) setLoginError('');
    };

    // --- YOUR PREFERRED onBlur LOGIC IS RESTORED ---
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const result = loginSchema.safeParse(formData);
        if (result.success) {
            setFormErrors({});
        } else {
            const newErrors = {};
            for (const issue of result.error.issues) {
                if (touched[issue.path[0]]) {
                    newErrors[issue.path[0]] = { _errors: [issue.message] };
                }
            }
            setFormErrors(newErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setTouched({ identifier: true, password: true });
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            setFormErrors(result.error.format());
            setShakeButton(p => p + 1);
            return;
        }

        setSubmitStatus('loading');
        try {
            const response = await fetch('http://127.0.0.1:8000/_allauth/app/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.identifier,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setLoginError(data.error || 'Invalid credentials. Please try again.');
                setSubmitStatus('error');
                setShakeButton(s => s + 1);
            } else {
                onLoginSuccess(data.user, formData.rememberMe);
                console.log("Login SEccessfill", data);
                console.log("YOUr token is:", data.access_token)
                localStorage.setItem('token', JSON.stringify(data.access_token))

            }

        } catch (error) {
            setLoginError('The email or password you entered is incorrect.');
            setSubmitStatus('error');
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
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to continue to CodeDash.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <input id="identifier" name="identifier" type="text" value={formData.identifier} onChange={handleChange} onBlur={handleBlur}
                            placeholder="you@example.com"
                            className="mt-1 block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        <AnimatePresence>{formErrors.identifier?._errors[0] && touched.identifier && <FormError message={formErrors.identifier._errors[0]} />}</AnimatePresence>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative mt-1">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} onBlur={handleBlur}
                                className="block w-full text-slate-900 dark:text-slate-100 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/40 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        <AnimatePresence>{formErrors.password?._errors[0] && touched.password && <FormError message={formErrors.password._errors[0]} />}</AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-800 dark:text-slate-200">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Forgot password?</Link>
                        </div>
                    </div>

                    <AnimatePresence>{loginError && <FormError message={loginError} />}</AnimatePresence>

                    <motion.div key={shakeButton} animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } }}>
                        <button type="submit" disabled={submitStatus === 'loading'}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitStatus === 'loading' ? 'Logging in...' : 'Log in'}
                        </button>
                    </motion.div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">Or continue with</span></div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <button type="button" onClick={() => alert("Social login coming soon!")}
                            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                            <AiFillGithub className="w-5 h-5 mr-2" />
                            Continue with GitHub
                        </button>
                        <button type="button" onClick={() => alert("Social login coming soon!")}
                            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                            <AiOutlineGoogle className="w-5 h-5 mr-2" />
                            Continue with Google
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}<Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign up</Link>
                </p>
            </div>
        </motion.main>
    );
}