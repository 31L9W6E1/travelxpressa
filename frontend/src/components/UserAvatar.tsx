import { getInitials, getAvatarColor } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export function UserAvatar({ name, email, size = 'md', className = '' }: UserAvatarProps) {
  const identifier = name || email || 'unknown';
  const initials = getInitials(name, email);
  const colors = getAvatarColor(identifier);

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-semibold ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      {initials}
    </div>
  );
}

export default UserAvatar;
