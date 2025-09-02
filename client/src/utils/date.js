// src/utils/date.js
export function formatDateSafe(input) {
    if (!input) return '—';
    const dt = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(dt.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(dt);
}
