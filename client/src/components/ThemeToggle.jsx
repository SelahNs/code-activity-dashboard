// In src/components/ThemeToggle.jsx
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, handleThemeToggle } = useTheme();
    return (
        <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
            {/* The hidden checkbox that holds the state */}
            <input
                type="checkbox"
                id="theme-toggle"
                className="sr-only peer" // sr-only hides it visually but keeps it for screen readers
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
            />
            {/* The background "track" of the toggle */}
            <div
                className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700"
            ></div>
            {/* The sliding "knob" */}
            <div
                className="absolute top-0.5 left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all dark:border-gray-600 peer-checked:translate-x-full peer-checked:bg-white"
            ></div>
        </label>
    );
}