import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
// Notion-like avatar colors (pastel/soft colors)
const avatarColors = [
    { bg: '#FFE4E6', fg: '#9F1239' }, // Rose
    { bg: '#FEF3C7', fg: '#92400E' }, // Amber
    { bg: '#D1FAE5', fg: '#065F46' }, // Emerald
    { bg: '#DBEAFE', fg: '#1E40AF' }, // Blue
    { bg: '#E0E7FF', fg: '#3730A3' }, // Indigo
    { bg: '#EDE9FE', fg: '#5B21B6' }, // Violet
    { bg: '#FCE7F3', fg: '#9D174D' }, // Pink
    { bg: '#ECFCCB', fg: '#3F6212' }, // Lime
    { bg: '#FED7AA', fg: '#9A3412' }, // Orange
    { bg: '#CFFAFE', fg: '#0E7490' }, // Cyan
];
// Hash string to number for consistent color selection
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
// Get initials from name or email
export function getInitials(name, email) {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    if (email) {
        return email.slice(0, 2).toUpperCase();
    }
    return '??';
}
// Get consistent avatar color based on user identifier
export function getAvatarColor(identifier) {
    const index = hashString(identifier) % avatarColors.length;
    return avatarColors[index];
}
// Generate avatar data URL (SVG)
export function generateAvatarDataUrl(name, email) {
    const identifier = name || email || 'unknown';
    const initials = getInitials(name, email);
    const colors = getAvatarColor(identifier);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${colors.bg}" rx="12"/>
      <text
        x="50"
        y="50"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="40"
        font-weight="600"
        fill="${colors.fg}"
      >${initials}</text>
    </svg>
  `.trim();
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
