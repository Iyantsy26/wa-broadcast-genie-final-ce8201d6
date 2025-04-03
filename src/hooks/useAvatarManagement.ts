
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createAvatarsBucket, validateAvatarFile, uploadAvatarToStorage, updateUserAvatarInDatabase } from "@/utils/avatarUtils";

export const useAvatarManagement = (user: User | null) => {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load avatar on component mount
  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        // First, ensure bucket exists with correct policies
        try {
          await createAvatarsBucket();
        } catch (err) {
          console.error("Error initializing avatars bucket:", err);
          // Continue anyway to try loading existing avatar
        }
        
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
      
      // Get user ID
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      setUploading(true);
      
      // First, ensure bucket exists with correct policies
      await createAvatarsBucket();
      
      // Validate file
      const validation = validateAvatarFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
      
      // Upload the file to storage
      const publicUrl = await uploadAvatarToStorage(user.id, file);
      
      // Update user data
      await updateUserAvatarInDatabase(user.id, publicUrl);
      
      // Update the UI with the new avatar
      setAvatarUrl(publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
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
