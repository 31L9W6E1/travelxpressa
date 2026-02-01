import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function getInitials(name?: string | null, email?: string | null): string;
export declare function getAvatarColor(identifier: string): {
    bg: string;
    fg: string;
};
export declare function generateAvatarDataUrl(name?: string | null, email?: string | null): string;
