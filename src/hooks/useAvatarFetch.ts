
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

export const useAvatarFetch = (user: User | null) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
  
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (user && user.id) {
          // For special super-admin ID, try to get from localStorage
          if (user.id === 'super-admin') {
            const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
            if (savedAvatar) {
              setAvatarUrl(savedAvatar);
            }
            return;
          }
          
          // Check user metadata first
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
            return;
          }
          
          // Try to get from team_members table
          const { data, error } = await supabase
            .from('team_members')
            .select('avatar')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.warn("Error fetching avatar:", error);
          } else if (data && data.avatar) {
            setAvatarUrl(data.avatar);
          }
        } else if (isSuperAdminMode) {
          // Get avatar from localStorage for super admin mode
          const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
          if (savedAvatar) {
            setAvatarUrl(savedAvatar);
          }
        }
      } catch (error) {
        console.error("Error in fetchAvatar:", error);
      }
    };
    
    fetchAvatar();
  }, [user, isSuperAdminMode]);
  
  return { avatarUrl, setAvatarUrl };
};
