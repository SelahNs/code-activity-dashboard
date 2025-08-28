import { motion } from "framer-motion"

export default function UsersPage() {
    return (
        <div>
            <motion.h1 layoutId="users-title" className="text-3xl font-bold text-gray-800 dark:text-slate-200">Users</motion.h1>
        </div >
    )
}