
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      }
    };
    
    fetchAvatar();
  }, [user]);

  const validateAvatarFile = (file: File) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!validateAvatarFile(file)) {
        return;
      }
      
      setUploading(true);
      
      // Get user ID
      let userId: string;
      
      if (user && user.id) {
        userId = user.id;
      } else {
        throw new Error("User not authenticated");
      }
      
      try {
        // Check if the avatars bucket exists or create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
        
        if (!avatarsBucketExists) {
          await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 2 * 1024 * 1024 // 2MB
          });
        }
        
        // Prepare file details
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        
        // Upload the file
        console.log("Uploading file to avatars bucket:", fileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });
          
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL for uploaded avatar");
        }
        
        const publicUrl = urlData.publicUrl;
        
        // Update auth user metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { 
            avatar_url: publicUrl 
          }
        });
        
        if (metadataError) {
          console.error("Error updating auth metadata:", metadataError);
          throw metadataError;
        }
        
        // Update team_members table
        const { error: teamError } = await supabase
          .from('team_members')
          .update({ 
            avatar: publicUrl,
            last_active: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (teamError) {
          console.error("Error updating team_member avatar:", teamError);
          throw teamError;
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
