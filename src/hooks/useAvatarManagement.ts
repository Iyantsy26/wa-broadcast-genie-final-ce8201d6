
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateAvatarFile, uploadAvatarToStorage, updateUserAvatar, updateTeamMemberAvatar } from '@/utils/avatarUtils';

export const useAvatarManagement = (user: User | null) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Check if we're in Super Admin mode
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

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
      } else if (isSuperAdmin) {
        // For super admin mode, try to retrieve from auth or team_members table
        try {
          const { data: superAdmins, error } = await supabase
            .from('team_members')
            .select('id, avatar')
            .eq('is_super_admin', true)
            .limit(1);
            
          if (superAdmins && superAdmins.length > 0 && superAdmins[0].avatar) {
            setAvatarUrl(superAdmins[0].avatar);
            return;
          }
        } catch (err) {
          console.error("Error looking up super admin avatar:", err);
        }
      }
    };
    
    fetchAvatar();
  }, [user, isSuperAdmin]);

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
      
      // Create a URL for the file to preview immediately
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // Get or create user ID
      let userId: string;
      
      if (user && user.id !== 'super-admin') {
        userId = user.id;
      } else {
        // For super admin, try to find existing super admin user
        const { data: admins } = await supabase
          .from('team_members')
          .select('id')
          .eq('is_super_admin', true)
          .limit(1);
          
        if (admins && admins.length > 0) {
          userId = admins[0].id;
        } else if (isSuperAdmin) {
          // Create a placeholder ID for super admin
          userId = 'super-admin';
        } else {
          throw new Error("Unable to determine user ID for avatar upload");
        }
      }
      
      // Upload the file
      const publicUrl = await uploadAvatarToStorage(userId, file);
      
      if (publicUrl) {
        // Update auth user metadata
        if (user) {
          await updateUserAvatar(userId, publicUrl);
        }
        
        // Always update team_members table
        await updateTeamMemberAvatar(userId, publicUrl, {
          name: user?.user_metadata?.name,
          email: user?.email,
          role: user?.user_metadata?.role
        });
        
        // Set the avatar URL in component state
        setAvatarUrl(publicUrl);
        
        toast({
          title: "Avatar updated",
          description: "Your avatar has been updated successfully.",
        });
      } else {
        throw new Error("Failed to get public URL for uploaded avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
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
