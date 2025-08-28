import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar({ currentPath }) {
    // A helper array to make the code cleaner (DRY principle)
    const navLinks = [
        { path: "/", label: "Dashboard", layoutId: "dashboard-title" },
        { path: "/reports", label: "Reports", layoutId: "reports-title" },
        { path: "/users", label: "Users", layoutId: "users-title" },
        { path: "/settings", label: "Settings", layoutId: "settings-title" },
        { path: "/login", label: "Login", layoutId: "login-title" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg dark:bg-gray-800/70 p-4">
            <ul className="flex space-x-4">
                {/* We now map over the array to create the links */}
                {navLinks.map(link => (
                    // Only render the link if it's not the current page
                    currentPath !== link.path && (
                        <li key={link.path}>
                            <motion.div layoutId={link.layoutId}>
                                <Link
                                    to={link.path}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            </motion.div>
                        </li>
                    )
                ))}
            </ul>
        </nav>
    );
}