import { jsx as _jsx } from "react/jsx-runtime";
import { getInitials, getAvatarColor } from '@/lib/utils';
const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
};
export function UserAvatar({ name, email, size = 'md', className = '' }) {
    const identifier = name || email || 'unknown';
    const initials = getInitials(name, email);
    const colors = getAvatarColor(identifier);
    return (_jsx("div", { className: `${sizeClasses[size]} rounded-xl flex items-center justify-center font-semibold ${className}`, style: { backgroundColor: colors.bg, color: colors.fg }, children: initials }));
}
export default UserAvatar;
