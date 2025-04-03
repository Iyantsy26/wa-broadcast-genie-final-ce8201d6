
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { 
  validateAvatarFile, 
  uploadAvatarToStorage, 
  updateUserAvatarInDatabase 
} from "@/utils/avatarUtils";

export const useAvatarUpload = (user: User | null) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload an avatar.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setUploading(true);
      
      // Validate the file
      const validation = validateAvatarFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return null;
      }
      
      // Upload the file to storage
      const publicUrl = await uploadAvatarToStorage(user.id, file);
      
      // Update user data
      await updateUserAvatarInDatabase(user.id, publicUrl);
      
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
    uploadAvatar
  };
};
