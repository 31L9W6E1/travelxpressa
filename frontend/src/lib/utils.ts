import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get initials from name or email
export function getInitials(name?: string | null, email?: string | null): string {
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
export function getAvatarColor(identifier: string): { bg: string; fg: string } {
  const index = hashString(identifier) % avatarColors.length;
  return avatarColors[index];
}

// Dicebear avatar (lorelei-neutral) URL generator.
// Seed should be stable and non-PII when possible (prefer user.id).
export function getDicebearAvatarUrl(seed: string): string {
  const normalized = (seed || "user").trim() || "user";
  const params = new URLSearchParams({ seed: normalized });
  return `https://api.dicebear.com/9.x/lorelei-neutral/svg?${params.toString()}`;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const avatarDataUrlCache = new Map<string, string>();

// Generate avatar data URL (SVG) - "Notion-ish" abstract background + initials.
export function generateAvatarDataUrl(name?: string | null, email?: string | null): string {
  const identifier = name || email || 'unknown';
  const initials = getInitials(name, email);
  const cacheKey = `${identifier}|${initials}`;
  const cached = avatarDataUrlCache.get(cacheKey);
  if (cached) return cached;

  const seed = hashString(identifier);
  const rand = mulberry32(seed);

  const base = avatarColors[seed % avatarColors.length];
  const secondary = avatarColors[(seed + 3) % avatarColors.length];
  const accentA = avatarColors[(seed + 5) % avatarColors.length];
  const accentB = avatarColors[(seed + 7) % avatarColors.length];

  const circles = [
    {
      cx: Math.round(rand() * 100),
      cy: Math.round(rand() * 100),
      r: Math.round(18 + rand() * 26),
      fill: accentA.fg,
      opacity: (0.10 + rand() * 0.14).toFixed(2),
    },
    {
      cx: Math.round(rand() * 100),
      cy: Math.round(rand() * 100),
      r: Math.round(14 + rand() * 22),
      fill: accentB.fg,
      opacity: (0.08 + rand() * 0.12).toFixed(2),
    },
    {
      cx: Math.round(rand() * 100),
      cy: Math.round(rand() * 100),
      r: Math.round(16 + rand() * 24),
      fill: base.fg,
      opacity: (0.06 + rand() * 0.10).toFixed(2),
    },
  ];

  const safeInitials = escapeXml(initials);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${base.bg}" />
      <stop offset="100%" stop-color="${secondary.bg}" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="18" fill="url(#bg)"/>
  ${circles
    .map(
      (c) =>
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${c.fill}" opacity="${c.opacity}"/>`
    )
    .join("\n  ")}
  <text
    x="50"
    y="52"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    font-size="40"
    font-weight="700"
    letter-spacing="-0.02em"
    fill="${base.fg}"
  >${safeInitials}</text>
</svg>
  `.trim();

  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  avatarDataUrlCache.set(cacheKey, dataUrl);
  return dataUrl;
}
