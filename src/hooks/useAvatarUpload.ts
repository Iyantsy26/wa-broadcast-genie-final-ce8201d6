
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAvatarUpload = (user: User | null) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const initStorageBucket = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-storage-bucket`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ bucketName: 'avatars', isPublic: true })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Storage bucket setup:", result.message);
      } else {
        console.warn("Storage setup warning:", result.error);
      }
    } catch (error) {
      console.error("Error initializing avatar storage:", error);
    }
  };
  
  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      // Determine user ID or use super-admin for special case
      const userId = user?.id || 'super-admin';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload the file to the avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update in localStorage for super admin persistence
      localStorage.setItem('superAdminAvatarUrl', publicUrl);
      
      // Update user metadata if we have a real user
      if (user && user.id) {
        await supabase.auth.updateUser({
          data: {
            avatar_url: publicUrl
          }
        });
        
        if (user.id !== 'super-admin') {
          // Update team_members table
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ avatar: publicUrl })
            .eq('id', user.id);
          
          if (updateError) {
            console.error("Error updating avatar in database:", updateError);
          }
        }
      }
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploading,
    uploadAvatar,
    initStorageBucket
  };
};
