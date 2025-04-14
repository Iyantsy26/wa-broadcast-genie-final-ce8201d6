
import { useState, useCallback } from 'react';

interface UseAvatarHandlingOptions {
  defaultInitials?: string;
  fallbackColor?: string;
}

export const useAvatarHandling = (options?: UseAvatarHandlingOptions) => {
  const [avatarError, setAvatarError] = useState<boolean>(false);
  
  /**
   * Checks if the provided avatar URL is valid
   */
  const isValidAvatarUrl = useCallback((url?: string | null): boolean => {
    return Boolean(url && typeof url === 'string' && url.trim() !== '');
  }, []);
  
  /**
   * Generate initials from a name
   */
  const getInitials = useCallback((name?: string | null): string => {
    if (!name) return options?.defaultInitials || 'U';
    
    return name
      .split(' ')
      .map(n => n?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [options?.defaultInitials]);
  
  /**
   * Handle avatar load error
   */
  const handleAvatarError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>, name?: string) => {
    console.warn(`Avatar image failed to load for ${name || 'unknown user'}`);
    setAvatarError(true);
    e.currentTarget.style.display = 'none';
  }, []);
  
  /**
   * Reset avatar error state (e.g., when switching to a new contact)
   */
  const resetAvatarError = useCallback(() => {
    setAvatarError(false);
  }, []);
  
  return {
    isValidAvatarUrl,
    getInitials,
    handleAvatarError,
    resetAvatarError,
    avatarError
  };
};
