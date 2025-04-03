
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

export const useAvatarFetch = (user: User | null) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (user && user.id) {
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
            .maybeSingle();
          
          if (error) {
            console.warn("Error fetching avatar:", error);
          } else if (data && data.avatar) {
            setAvatarUrl(data.avatar);
          }
        }
      } catch (error) {
        console.error("Error in fetchAvatar:", error);
      }
    };
    
    fetchAvatar();
  }, [user]);
  
  return { avatarUrl, setAvatarUrl };
};
