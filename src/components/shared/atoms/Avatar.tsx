import React, { useState } from 'react';
import { getAvatarUrl } from '@/utils/avatar.utils';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: any;
  seed?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  seed,
  alt = 'User Avatar',
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = true,
}) => {
  const avatarSrc = getAvatarUrl(user, seed);
  const [hasError, setHasError] = useState(false);

  const fallbackLetter = (
    user?.firstName?.[0] || 
    user?.username?.[0] || 
    user?.email?.[0] || 
    'U'
  ).toUpperCase();

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs select-none',
          sizeClasses[size]
        )}
      >
        {!hasError ? (
          <img
            src={avatarSrc}
            alt={alt}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {fallbackLetter}
          </span>
        )}
      </div>

      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};
