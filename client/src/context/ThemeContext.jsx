import { useEffect, useState, useContext, createContext } from "react";

const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        if (theme === 'dark') {
            root.classList.add('dark');
            body.style.backgroundColor = '#111827';
        } else {
            root.classList.remove('dark');
            body.style.backgroundColor = '#ffffff';
        }
    }, [theme]);

    function handleThemeToggle() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }
    const value = { theme, handleThemeToggle }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext);
}