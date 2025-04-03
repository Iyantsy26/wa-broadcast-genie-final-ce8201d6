
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
        console.log("Fetching avatar for user:", user.id);
        try {
          // First, ensure bucket exists with correct policies
          await createAvatarsBucket();
        } catch (err) {
          console.error("Error initializing avatars bucket:", err);
          // Continue anyway to try loading existing avatar
        }
        
        // Check if user has an avatar in metadata
        if (user.user_metadata?.avatar_url) {
          console.log("Found avatar in user metadata");
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
            console.log("Found avatar in team_members table");
            setAvatarUrl(teamMember.avatar);
            return;
          }
          
          if (error && !error.message.includes("JSON")) {
            console.error("Error fetching avatar from team_members:", error);
          }
        } catch (err) {
          console.error("Error loading avatar from team_members:", err);
        }
      } else {
        // If no user, try to load from localStorage for super admin
        const savedAvatar = localStorage.getItem('superAdminAvatarUrl');
        if (savedAvatar) {
          setAvatarUrl(savedAvatar);
          console.log("Loaded avatar from localStorage for super admin");
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
      
      // Check for super admin mode
      const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
      
      // Special handling for super admin mode without auth
      if (isSuperAdminMode && (!user || user.id === 'super-admin')) {
        console.log("Handling avatar upload in super admin mode");
        
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
        
        // For super admin, just save to localStorage
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            localStorage.setItem('superAdminAvatarUrl', dataUrl);
            setAvatarUrl(dataUrl);
            toast({
              title: "Avatar updated",
              description: "Your profile picture has been updated successfully.",
            });
          }
        };
        reader.readAsDataURL(file);
        return;
      }
      
      // Get user ID for regular auth flow
      if (!user || !user.id || user.id === 'super-admin') {
        throw new Error("User not properly authenticated");
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
      
      console.log("Uploading avatar for user:", user.id);
      
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
