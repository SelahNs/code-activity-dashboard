import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import {motion} from 'framer-motion'
import {AiFillGithub} from 'react-icons/ai'

export default function AuthSuccessPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const userRaw = params.get('user');

        if (!accessToken || !refreshToken || !userRaw) {
            navigate('/login');
            return;
        }

        try {
            const user = JSON.parse(decodeURIComponent(userRaw));

            // Assemble exactly what login() expects
            login({
                meta: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
                data: { user }
            }, false);

            navigate('/dashboard');
        } catch (e) {
            navigate('/login');
        }
    }, []);

        return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-6">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
            <AiFillGithub className="w-12 h-12 text-slate-700 dark:text-slate-300" />
        </motion.div>
        <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Signing you in with GitHub
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Just a moment...
            </p>
        </div>
        <motion.div
            className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
        >
            <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />
        </motion.div>
    </div>
);
    
}