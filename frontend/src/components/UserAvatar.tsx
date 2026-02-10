import { generateAvatarDataUrl } from '@/lib/utils';

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
  const identifier = name || email || 'User';
  const src = generateAvatarDataUrl(name, email);

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl overflow-hidden ${className}`}
      aria-label={identifier || 'User avatar'}
    >
      <img
        src={src}
        alt={identifier || 'User avatar'}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

export default UserAvatar;
