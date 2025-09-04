// src/components/Toast.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import useNotificationStore from '../stores/useNotificationStore';

export default function Toast() {
    const { message, type, isVisible, hideNotification } = useNotificationStore();

    const isSuccess = type === 'success';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`fixed top-5 right-5 z-50 flex items-center p-4 max-w-sm w-full rounded-lg shadow-lg text-white ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
                    role="alert"
                >
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
                        {isSuccess ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="ml-3 text-sm font-medium">{message}</div>
                    <button
                        type="button"
                        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/20"
                        onClick={hideNotification}
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}