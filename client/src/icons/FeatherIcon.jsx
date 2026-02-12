// src/icons/FeatherIcon.jsx

export default function FeatherIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <path d="m2.25 15.75 5.25-5.25" />
            <path d="m13.5 6.75 5.25-5.25" />
        </svg>
    );
}