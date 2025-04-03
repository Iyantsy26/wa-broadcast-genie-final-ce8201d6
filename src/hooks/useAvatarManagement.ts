
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateAvatarFile, uploadAvatarToStorage, updateUserAvatar, updateTeamMemberAvatar } from '@/utils/avatarUtils';

export const useAvatarManagement = (user: User | null) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load avatar on component mount
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        // Check if user has an avatar in metadata
        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
          return;
        }
        
        // Check team_members table for avatar
        try {
          const { data: teamMember, error } = await supabase
            .from('team_members')
            .select('avatar')
            .eq('id', user.id)
            .maybeSingle();
            
          if (teamMember?.avatar) {
            setAvatarUrl(teamMember.avatar);
            return;
          }
        } catch (err) {
          console.error("Error loading avatar from team_members:", err);
        }
      } else if (localStorage.getItem('isSuperAdmin') === 'true') {
        // If in Super Admin mode, check localStorage for saved avatar
        const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
        if (savedAvatar) {
          setAvatarUrl(savedAvatar);
        }
      }
    };
    
    fetchAvatar();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!validateAvatarFile(file, toast)) {
        return;
      }
      
      setUploading(true);
      
      // Get user ID
      let userId: string;
      
      if (user && user.id) {
        userId = user.id;
      } else if (localStorage.getItem('isSuperAdmin') === 'true') {
        userId = 'super-admin';
      } else {
        throw new Error("User not authenticated");
      }
      
      try {
        // Upload avatar to Supabase Storage
        const publicUrl = await uploadAvatarToStorage(userId, file);
        
        if (!publicUrl) {
          throw new Error("Failed to get public URL for uploaded avatar");
        }
        
        // Update user metadata if we have a real user
        if (user && user.id) {
          await updateUserAvatar(userId, publicUrl);
          
          // Update team_members table
          await updateTeamMemberAvatar(userId, publicUrl);
        } else if (localStorage.getItem('isSuperAdmin') === 'true') {
          // For Super Admin mode without actual user, save in localStorage
          localStorage.setItem('superAdminAvatarUrl', publicUrl);
        }
        
        // Set the avatar URL in component state
        setAvatarUrl(publicUrl);
        
        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated successfully.",
        });
      } catch (error: any) {
        console.error("Error in avatar upload operations:", error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload avatar. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    avatarUrl,
    uploading,
    handleAvatarUpload
  };
};
