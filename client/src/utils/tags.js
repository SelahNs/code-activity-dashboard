// src/utils/tags.js
export function hashToHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.abs(hash) % 360;
}

export function getTagColor(tag) {
    const hue = hashToHue(tag);
    return `hsl(${hue} 85% 88%)`; // pastel background (Tailwind style: H S% L%)
}

export function getTagTextColor(tag) {
    const hue = hashToHue(tag);
    return `hsl(${hue} 75% 30%)`; // readable dark text
}
