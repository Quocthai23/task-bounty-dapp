/**
 * Helper to get a synchronized avatar URL for any user object or identifier.
 * Priority:
 * 1. user.avatarUrl (if valid and not empty)
 * 2. user.profile.avatarUrl
 * 3. Seeded Dicebear Avataaars SVG based on email/id/name
 */
export function getAvatarUrl(user?: any, fallbackSeed?: string): string {
  if (!user && !fallbackSeed) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
  }

  if (typeof user === 'string' && user.trim().length > 0) {
    // If passed a URL string
    if (user.startsWith('http') || user.startsWith('data:image')) {
      return user;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user)}`;
  }

  const directAvatar = user?.avatarUrl || user?.profile?.avatarUrl;
  if (directAvatar && typeof directAvatar === 'string' && directAvatar.trim().length > 0) {
    return directAvatar;
  }

  const seed = 
    user?.email || 
    user?.username || 
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) || 
    user?.id || 
    fallbackSeed || 
    'user';

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
