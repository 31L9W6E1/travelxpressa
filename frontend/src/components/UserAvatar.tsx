import { generateAvatarDataUrl, getDicebearAvatarUrl } from '@/lib/utils';

interface UserAvatarProps {
  seed?: string | null;
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

export function UserAvatar({ seed, name, email, size = 'md', className = '' }: UserAvatarProps) {
  const identifier = name || email || 'User';
  const dicebearSeed = (seed || '').trim() || email || name || identifier || 'User';
  const src = getDicebearAvatarUrl(dicebearSeed);
  const fallbackSrc = generateAvatarDataUrl(name, email);

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
        referrerPolicy="no-referrer"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.src !== fallbackSrc) img.src = fallbackSrc;
        }}
      />
    </div>
  );
}

export default UserAvatar;
